// eventoController.js — Agenda / calendario inteligente (Tarjeta 4)
import prisma from '../config/db.js';
import {
  isoADate, fechaDBaISO, hoyISO, sumarDiasISO, horaADate, dateAHora, rangoFechas, eventoOcurreEn,
} from '../utils/fechas.js';
import { nivelStock } from './inventarioController.js';
import { asegurarEtapasPorDefecto } from '../utils/etapas.js';
import { enviarCorreo } from '../services/correoService.js';

export const TIPOS_EVENTO = ['General', 'Vacunación', 'Pago', 'Mantenimiento', 'Venta', 'Cobro', 'Inventario', 'Reunión'];
const RECURRENCIAS = ['Ninguna', 'Semanal', 'Mensual'];

const COLORES = {
  'Vacunación': '#0d9488', Salud: '#0d9488', Pago: '#7c3aed', Mantenimiento: '#ea580c', Venta: '#059669',
  Cobro: '#9333ea', Inventario: '#0284c7', Reunión: '#475569', General: '#334155', Stock: '#dc2626', Etapa: '#ca8a04',
};

const serializar = (e) => ({
  ...e,
  fecha: fechaDBaISO(e.fecha),
  fechaFin: fechaDBaISO(e.fechaFin),
  hora: dateAHora(e.hora),
});

const leerCuerpo = (body) => {
  const recurrencia = RECURRENCIAS.includes(body.recurrencia) ? body.recurrencia : 'Ninguna';
  return {
    titulo: body.titulo?.trim() || null,
    tipo: body.tipo || 'General',
    fecha: isoADate(body.fecha),
    hora: body.hora ? horaADate(body.hora) : null,
    descripcion: body.descripcion || '',
    estado: body.estado || 'Programado',
    recurrencia,
    diasSemana: recurrencia === 'Semanal' ? (body.diasSemana || null) : null,
    fechaFin: body.fechaFin ? isoADate(body.fechaFin) : null,
    notificarCorreo: Boolean(body.notificarCorreo),
    correoDestino: body.correoDestino?.trim() || null,
  };
};

// GET /api/eventos — eventos guardados (sin expandir)
export const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: { empleado: { select: { idEmpleado: true, nombreCompleto: true } } },
      orderBy: { fecha: 'asc' },
    });
    res.json(eventos.map(serializar));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos', details: error.message });
  }
};

/**
 * Ocurrencias (eventos guardados + automáticos) entre dos fechas ISO.
 * Se usa en el calendario, en las notificaciones y en el programador de correos.
 */
export const ocurrenciasEnRango = async (desde, hasta) => {
  const resultado = [];

  // 1) Eventos guardados (con recurrencia expandida)
  const eventos = await prisma.evento.findMany({
    where: { fecha: { lte: isoADate(hasta) }, OR: [{ fechaFin: null }, { fechaFin: { gte: isoADate(desde) } }] },
    include: { empleado: { select: { nombreCompleto: true } } },
  });
  for (const e of eventos) {
    for (const dia of rangoFechas(desde, hasta)) {
      if (!eventoOcurreEn(e, dia)) continue;
      const hora = dateAHora(e.hora);
      resultado.push({
        id: `evento-${e.idEvento}-${dia}`, idEvento: e.idEvento, origen: 'evento',
        title: e.titulo || e.tipo, start: hora ? `${dia}T${hora}` : dia, allDay: !hora,
        color: COLORES[e.tipo] || COLORES.General, editable: e.recurrencia === 'Ninguna',
        extendedProps: {
          tipo: e.tipo, descripcion: e.descripcion, estado: e.estado, recurrencia: e.recurrencia,
          responsable: e.empleado?.nombreCompleto, notificarCorreo: e.notificarCorreo, fecha: dia,
        },
      });
    }
  }

  // 2) Campañas del módulo de Salud
  const controles = await prisma.controlSanitario.findMany({
    where: { fecha: { gte: isoADate(desde), lte: isoADate(hasta) } },
    include: { corral: true, empleado: { select: { nombreCompleto: true } }, _count: { select: { tratamientos: true } } },
  });
  for (const c of controles) {
    const dia = fechaDBaISO(c.fecha);
    resultado.push({
      id: `salud-${c.idControl}`, origen: 'salud', title: `💉 ${c.tipo}: ${c.producto}`, start: dia, allDay: true,
      color: COLORES.Salud, editable: false,
      extendedProps: {
        tipo: 'Vacunación', estado: c.estado, responsable: c.empleado?.nombreCompleto, fecha: dia,
        descripcion: `${c.corral ? `Corral ${c.corral.nombre}. ` : ''}${c._count.tratamientos} animales. Dosis: ${c.dosis || 'N/D'}. ${c.observaciones || ''}`,
      },
    });
  }

  // 3) Alertas de stock bajo / crítico (se muestran hoy, si hoy entra en el rango)
  const hoy = hoyISO();
  if (hoy >= desde && hoy <= hasta) {
    const items = (await prisma.inventario.findMany({ where: { activo: true } }))
      .map(i => ({ ...i, nivel: nivelStock(i) })).filter(i => i.nivel !== 'ok');
    for (const i of items) {
      resultado.push({
        id: `stock-${i.idInventario}`, origen: 'stock',
        title: `${i.nivel === 'critico' ? '🔴' : '🟡'} Stock ${i.nivel === 'critico' ? 'crítico' : 'bajo'}: ${i.nombre}`,
        start: hoy, allDay: true, color: i.nivel === 'critico' ? COLORES.Stock : '#d97706', editable: false,
        extendedProps: { tipo: 'Inventario', fecha: hoy,
          descripcion: `Quedan ${i.cantidadActual} ${i.unidad} (mínimo ${i.stockMinimo}, crítico ${i.stockCritico}).` },
      });
    }
  }

  // 4) Cambios de etapa de desarrollo previstos (Tarjeta 7)
  await asegurarEtapasPorDefecto();
  const animales = await prisma.animal.findMany({
    where: { estado: 'Vivo', fechaNacimiento: { not: null } },
    select: { idAnimal: true, areteBandera: true, nombre: true, fechaNacimiento: true,
      tipoAnimal: { select: { etapas: true } } },
  });
  for (const a of animales) {
    for (const etapa of a.tipoAnimal.etapas) {
      if (etapa.mesInicio === 0) continue;
      const fecha = new Date(a.fechaNacimiento);
      fecha.setUTCMonth(fecha.getUTCMonth() + etapa.mesInicio);
      const dia = fecha.toISOString().slice(0, 10);
      if (dia < desde || dia > hasta) continue;
      resultado.push({
        id: `etapa-${a.idAnimal}-${etapa.idEtapa}`, origen: 'etapa',
        title: `🐮 ${a.areteBandera} pasa a ${etapa.nombre}`, start: dia, allDay: true, color: COLORES.Etapa, editable: false,
        extendedProps: { tipo: 'Etapa', fecha: dia, idAnimal: a.idAnimal,
          descripcion: `${a.nombre || a.areteBandera} cumple ${etapa.mesInicio} meses y entra a la etapa "${etapa.nombre}".` },
      });
    }
  }

  return resultado;
};

// GET /api/eventos/calendario?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
export const obtenerCalendario = async (req, res) => {
  try {
    const desde = (req.query.desde || sumarDiasISO(hoyISO(), -31)).slice(0, 10);
    const hasta = (req.query.hasta || sumarDiasISO(hoyISO(), 62)).slice(0, 10);
    res.json(await ocurrenciasEnRango(desde, hasta));
  } catch (error) {
    res.status(500).json({ error: 'Error al construir el calendario', details: error.message });
  }
};

// GET /api/eventos/proximos?dias=7
export const obtenerProximos = async (req, res) => {
  try {
    const dias = Math.min(60, Number(req.query.dias) || 7);
    const hoy = hoyISO();
    const lista = await ocurrenciasEnRango(hoy, sumarDiasISO(hoy, dias));
    res.json(lista.sort((a, b) => String(a.start).localeCompare(String(b.start))));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener próximos eventos', details: error.message });
  }
};

// POST /api/eventos
export const crearEvento = async (req, res) => {
  try {
    if (!req.body.fecha) return res.status(400).json({ error: 'La fecha es obligatoria' });
    if (!req.body.titulo?.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
    let idEmpleado = Number(req.body.idEmpleado) || null;
    if (!idEmpleado) {
      const admin = await prisma.empleado.findFirst({ where: { rol: { in: ['Administrador', 'administrador'] } } });
      idEmpleado = admin?.idEmpleado;
    }
    if (!idEmpleado) return res.status(400).json({ error: 'Indica el responsable del evento' });

    const evento = await prisma.evento.create({ data: { ...leerCuerpo(req.body), idEmpleado } });
    res.status(201).json({ message: 'Evento agregado al calendario', evento: serializar(evento) });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el evento', details: error.message });
  }
};

// PUT /api/eventos/:id
export const actualizarEvento = async (req, res) => {
  try {
    const data = leerCuerpo(req.body);
    if (req.body.idEmpleado) data.idEmpleado = Number(req.body.idEmpleado);
    const evento = await prisma.evento.update({ where: { idEvento: Number(req.params.id) }, data });
    res.json({ message: 'Evento actualizado', evento: serializar(evento) });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el evento', details: error.message });
  }
};

// PATCH /api/eventos/:id/mover { fecha } — arrastrar y soltar en el calendario
export const moverEvento = async (req, res) => {
  try {
    const evento = await prisma.evento.update({
      where: { idEvento: Number(req.params.id) },
      data: { fecha: isoADate(req.body.fecha), ...(req.body.hora !== undefined ? { hora: horaADate(req.body.hora) } : {}) },
    });
    res.json({ message: 'Evento reprogramado', evento: serializar(evento) });
  } catch (error) {
    res.status(500).json({ error: 'Error al mover el evento', details: error.message });
  }
};

// DELETE /api/eventos/:id
export const eliminarEvento = async (req, res) => {
  try {
    await prisma.evento.delete({ where: { idEvento: Number(req.params.id) } });
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el evento', details: error.message });
  }
};

// Plantilla de correo para un evento
export const correoDeEvento = (evento, dia) => ({
  para: evento.correoDestino || undefined,
  asunto: `📅 Recordatorio: ${evento.titulo || evento.tipo} (${dia})`,
  titulo: evento.titulo || evento.tipo,
  html: `<p><strong>Fecha:</strong> ${dia}${evento.hora ? ` a las ${dateAHora(evento.hora)}` : ''}</p>
         <p><strong>Tipo:</strong> ${evento.tipo}${evento.recurrencia !== 'Ninguna' ? ` · se repite (${evento.recurrencia.toLowerCase()})` : ''}</p>
         <p>${evento.descripcion || ''}</p>`,
});

// POST /api/eventos/:id/enviar-correo — envío manual inmediato (sirve para probar la configuración SMTP)
export const enviarCorreoEvento = async (req, res) => {
  try {
    const evento = await prisma.evento.findUnique({ where: { idEvento: Number(req.params.id) } });
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    const resultado = await enviarCorreo(correoDeEvento(evento, fechaDBaISO(evento.fecha)));
    if (!resultado.enviado) return res.status(400).json({ error: `No se pudo enviar: ${resultado.error}` });
    res.json({
      message: resultado.simulado
        ? `Correo generado en modo simulación (configura SMTP_HOST para enviarlo de verdad) → ${resultado.destinatarios.join(', ')}`
        : `Correo enviado a ${resultado.destinatarios.join(', ')}`,
      ...resultado,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el correo', details: error.message });
  }
};
