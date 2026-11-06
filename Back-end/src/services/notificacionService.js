// services/notificacionService.js — Consolida las alertas del sistema en la tabla notificaciones (Tarjeta 6)
//
// Cada alerta tiene una "clave" única. Si la condición sigue vigente no se duplica; si el usuario la
// borra se marca eliminada y no vuelve a aparecer; si la condición desaparece (ej. se reabasteció el stock)
// la notificación automática se elimina para que pueda volver a generarse en el futuro.
import prisma from '../config/db.js';
import { nivelStock } from '../controllers/inventarioController.js';
import { ocurrenciasEnRango } from '../controllers/eventoController.js';
import { hoyISO, sumarDiasISO } from '../utils/fechas.js';
import { asegurarEtapasPorDefecto, calcularEtapa } from '../utils/etapas.js';

const DIAS_ANTICIPACION_EVENTOS = 3;
const DIAS_AVISO_ETAPA = 7;

let ultimaSincronizacion = 0;
let sincronizando = null;

const alertasEndogamia = async () => {
  const animales = await prisma.animal.findMany({
    where: { estado: 'Vivo', OR: [{ idPadre: { not: null } }, { idMadre: { not: null } }] },
    include: {
      corral: { select: { nombre: true } },
      padre: { select: { idAnimal: true, areteBandera: true, idCorral: true, estado: true } },
      madre: { select: { idAnimal: true, areteBandera: true, idCorral: true, estado: true } },
    },
  });
  const alertas = [];
  for (const a of animales) {
    for (const [rol, progenitor] of [['padre', a.padre], ['madre', a.madre]]) {
      if (progenitor && progenitor.estado === 'Vivo' && progenitor.idCorral === a.idCorral) {
        alertas.push({
          clave: `endogamia-${a.idAnimal}-${progenitor.idAnimal}-${a.idCorral}`,
          tipo: 'Endogamia', severidad: 'critico', vista: 'ganado',
          titulo: `Riesgo de endogamia en ${a.corral.nombre}`,
          mensaje: `${a.areteBandera} comparte corral con su ${rol} (${progenitor.areteBandera}). Considera separarlos.`,
        });
      }
    }
  }
  return { prefijo: 'endogamia-', alertas };
};

const alertasStock = async () => {
  const items = await prisma.inventario.findMany({ where: { activo: true } });
  const alertas = items
    .map(i => ({ ...i, nivel: nivelStock(i) }))
    .filter(i => i.nivel !== 'ok')
    .map(i => ({
      clave: `stock-${i.idInventario}-${i.nivel}`,
      tipo: 'Stock', severidad: i.nivel === 'critico' ? 'critico' : 'aviso', vista: 'inventario',
      titulo: `${i.nivel === 'critico' ? 'Stock crítico' : 'Stock insuficiente'}: ${i.nombre}`,
      mensaje: `Quedan ${i.cantidadActual} ${i.unidad}. Umbral mínimo ${i.stockMinimo}, crítico ${i.stockCritico}.`,
    }));
  return { prefijo: 'stock-', alertas };
};

const alertasEventos = async () => {
  const hoy = hoyISO();
  const ocurrencias = await ocurrenciasEnRango(hoy, sumarDiasISO(hoy, DIAS_ANTICIPACION_EVENTOS));
  const alertas = ocurrencias
    .filter(o => o.origen === 'evento' || o.origen === 'salud')
    .map(o => {
      const dia = o.extendedProps.fecha;
      const cuando = dia === hoy ? 'hoy' : dia === sumarDiasISO(hoy, 1) ? 'mañana' : `el ${dia}`;
      return {
        clave: o.id.slice(0, 120),
        tipo: 'Evento', severidad: dia === hoy ? 'aviso' : 'info', vista: 'calendario',
        titulo: `Próximo: ${o.title}`,
        mensaje: `Programado ${cuando}${o.extendedProps.responsable ? ` · Responsable: ${o.extendedProps.responsable}` : ''}.`,
      };
    });
  // Los eventos ya pasados no se borran (son históricos), por eso no se limpia por prefijo
  return { prefijo: null, alertas };
};

const alertasIncidencias = async () => {
  const pendientes = await prisma.reporte.findMany({
    where: { estado: 'Pendiente' },
    include: { empleado: { select: { nombreCompleto: true } } },
  });
  const alertas = pendientes.map(r => ({
    clave: `incidencia-${r.idReporte}`,
    tipo: 'Incidencia', severidad: r.prioridad === 'Alta' ? 'critico' : 'aviso', vista: 'incidencias',
    titulo: `Nuevo reporte: ${r.titulo}`,
    mensaje: `${r.empleado.nombreCompleto} reportó "${r.tipoIncidencia}" (prioridad ${r.prioridad}).`,
  }));
  return { prefijo: null, alertas };
};

const alertasEtapas = async () => {
  await asegurarEtapasPorDefecto();
  const animales = await prisma.animal.findMany({
    where: { estado: 'Vivo', fechaNacimiento: { not: null } },
    select: { idAnimal: true, areteBandera: true, fechaNacimiento: true, tipoAnimal: { select: { etapas: true } } },
  });
  const alertas = [];
  for (const a of animales) {
    const info = calcularEtapa(a.fechaNacimiento, a.tipoAnimal.etapas);
    if (!info) continue;
    // Cambio de etapa reciente
    const diasEnEtapa = Math.floor((Date.now() - info.fechaInicioEtapa) / 86400000);
    if (info.etapa.mesInicio > 0 && diasEnEtapa <= DIAS_AVISO_ETAPA) {
      alertas.push({
        clave: `etapa-${a.idAnimal}-${info.etapa.idEtapa}`,
        tipo: 'Etapa', severidad: 'info', vista: 'ganado',
        titulo: `${a.areteBandera} entró a la etapa ${info.etapa.nombre}`,
        mensaje: `Cumplió ${info.edadMeses} meses. Revisa su manejo, alimentación y corral.`,
      });
    }
  }
  return { prefijo: null, alertas };
};

/** Recalcula todas las alertas. Con `forzar` = false se limita a una vez por minuto. */
export const sincronizarNotificaciones = async ({ forzar = false } = {}) => {
  if (!forzar && Date.now() - ultimaSincronizacion < 60_000) return;
  if (sincronizando) return sincronizando;

  sincronizando = (async () => {
    try {
      const grupos = await Promise.all([alertasEndogamia(), alertasStock(), alertasEventos(), alertasIncidencias(), alertasEtapas()]);
      for (const { prefijo, alertas } of grupos) {
        const claves = alertas.map(a => a.clave);
        if (alertas.length) {
          await prisma.notificacion.createMany({ data: alertas, skipDuplicates: true });
        }
        // Alertas automáticas cuya condición ya no se cumple (no se tocan las que el usuario borró)
        if (prefijo) {
          await prisma.notificacion.deleteMany({
            where: { clave: { startsWith: prefijo, notIn: claves.length ? claves : ['__ninguna__'] }, eliminada: false },
          });
        }
      }
      ultimaSincronizacion = Date.now();
    } catch (error) {
      console.error('Error al sincronizar notificaciones:', error.message);
    } finally {
      sincronizando = null;
    }
  })();
  return sincronizando;
};
