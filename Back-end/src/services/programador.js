// services/programador.js — Tareas programadas: recordatorios por correo y resumen de stock (Tarjeta 4)
//
// Se ejecuta al arrancar el servidor y luego cada PROGRAMADOR_MINUTOS (15 por defecto).
// Desactívalo con PROGRAMADOR_ACTIVO=false (útil si corres varias instancias).
// HORA_RESUMEN_STOCK (0-23, por defecto 7) controla a partir de qué hora se manda el resumen diario.
import prisma from '../config/db.js';
import { enviarCorreo } from './correoService.js';
import { sincronizarNotificaciones } from './notificacionService.js';
import { correoDeEvento } from '../controllers/eventoController.js';
import { nivelStock } from '../controllers/inventarioController.js';
import { hoyISO, aISOFecha, eventoOcurreEn } from '../utils/fechas.js';

let ultimoResumenStock = null; // Fecha ISO del último resumen enviado (en memoria)

// Recordatorio el mismo día de cada evento marcado con "notificar por correo"
const enviarRecordatoriosDeEventos = async () => {
  const hoy = hoyISO();
  const eventos = await prisma.evento.findMany({ where: { notificarCorreo: true } });
  for (const evento of eventos) {
    if (!eventoOcurreEn(evento, hoy)) continue;
    if (evento.ultimoEnvio && aISOFecha(evento.ultimoEnvio) === hoy) continue;
    const resultado = await enviarCorreo(correoDeEvento(evento, hoy));
    if (resultado.enviado) {
      await prisma.evento.update({ where: { idEvento: evento.idEvento }, data: { ultimoEnvio: new Date() } });
    }
  }
};

// Un correo diario con los artículos en stock bajo o crítico
const enviarResumenDeStock = async () => {
  const hoy = hoyISO();
  const horaMinima = Number(process.env.HORA_RESUMEN_STOCK ?? 7);
  if (ultimoResumenStock === hoy || new Date().getHours() < horaMinima) return;

  const items = (await prisma.inventario.findMany({ where: { activo: true } }))
    .map(i => ({ ...i, nivel: nivelStock(i) }))
    .filter(i => i.nivel !== 'ok')
    .sort((a, b) => (a.nivel === 'critico' ? -1 : 1) - (b.nivel === 'critico' ? -1 : 1));
  if (!items.length) { ultimoResumenStock = hoy; return; }

  const filas = items.map(i => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${i.nivel === 'critico' ? '🔴' : '🟡'} ${i.nombre}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${i.cantidadActual} ${i.unidad}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${i.stockMinimo} / ${i.stockCritico}</td>
    </tr>`).join('');

  const resultado = await enviarCorreo({
    asunto: `📦 ${items.length} artículo(s) con stock bajo — ${hoy}`,
    titulo: 'Resumen diario de inventario',
    html: `<p>Los siguientes artículos requieren reabastecimiento:</p>
      <table style="border-collapse:collapse;width:100%;font-size:13px">
        <tr style="background:#f1f5f9;text-align:left"><th style="padding:6px 8px">Artículo</th><th style="padding:6px 8px">Disponible</th><th style="padding:6px 8px">Mín. / Crít.</th></tr>
        ${filas}
      </table>`,
  });
  if (resultado.enviado) ultimoResumenStock = hoy;
};

export const ejecutarTareas = async () => {
  try {
    await sincronizarNotificaciones({ forzar: true });
    await enviarRecordatoriosDeEventos();
    await enviarResumenDeStock();
  } catch (error) {
    console.error('Error en tareas programadas:', error.message);
  }
};

export const iniciarProgramador = () => {
  if (process.env.PROGRAMADOR_ACTIVO === 'false') return;
  const minutos = Number(process.env.PROGRAMADOR_MINUTOS || 15);
  setTimeout(ejecutarTareas, 5_000);
  setInterval(ejecutarTareas, minutos * 60_000);
  console.log(`⏰ Programador de alertas activo (cada ${minutos} min)`);
};
