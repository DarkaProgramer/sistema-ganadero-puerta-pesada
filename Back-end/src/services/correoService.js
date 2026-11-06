// services/correoService.js — Envío de correos con Nodemailer (Tarjeta 4)
//
// Variables de entorno:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true" para 465), SMTP_USER, SMTP_PASS
//   SMTP_FROM       Remitente, ej. "Rancho Puerta Pesada <avisos@rancho.com>"
//   ALERTAS_CORREO  Destinatarios por defecto de las alertas (separados por coma).
//                   Si se deja vacío se usan los correos de los administradores.
//
// Si SMTP_HOST no está definido el servicio funciona en "modo simulación":
// el correo se genera y se imprime en consola, pero no se envía.
import nodemailer from 'nodemailer';
import prisma from '../config/db.js';

let transporter = null;

export const modoSimulacion = () => !process.env.SMTP_HOST;

const obtenerTransporter = () => {
  if (transporter) return transporter;
  transporter = modoSimulacion()
    ? nodemailer.createTransport({ jsonTransport: true })
    : nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
  return transporter;
};

// Destinatarios por defecto: ALERTAS_CORREO o, si no existe, todos los administradores activos
export const destinatariosPorDefecto = async () => {
  if (process.env.ALERTAS_CORREO) {
    return process.env.ALERTAS_CORREO.split(',').map(c => c.trim()).filter(Boolean);
  }
  const admins = await prisma.empleado.findMany({
    where: { rol: { in: ['Administrador', 'administrador', 'Admin', 'admin'] }, estatus: { not: 'Inactivo' } },
    select: { correo: true },
  });
  return admins.map(a => a.correo);
};

const plantillaHTML = (titulo, cuerpoHTML) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#047857;color:#fff;padding:16px 20px;font-size:16px;font-weight:bold">${titulo}</div>
    <div style="padding:20px;color:#334155;font-size:14px;line-height:1.5">${cuerpoHTML}</div>
    <div style="padding:12px 20px;background:#f8fafc;color:#94a3b8;font-size:12px">Aviso automático del Sistema de Gestión Ganadera.</div>
  </div>`;

/**
 * Envía un correo. `para` puede ser string o arreglo; si se omite se usan los destinatarios por defecto.
 * Devuelve { enviado, simulado, destinatarios, error? } y nunca lanza excepción.
 */
export const enviarCorreo = async ({ para, asunto, titulo, html, texto }) => {
  try {
    let destinatarios = Array.isArray(para) ? para : (para ? para.split(',') : await destinatariosPorDefecto());
    destinatarios = destinatarios.map(d => d.trim()).filter(Boolean);
    if (!destinatarios.length) return { enviado: false, simulado: modoSimulacion(), destinatarios, error: 'Sin destinatarios' };

    const info = await obtenerTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'Sistema Ganadero <no-reply@rancho.local>',
      to: destinatarios.join(', '),
      subject: asunto,
      text: texto || asunto,
      html: plantillaHTML(titulo || asunto, html || texto || ''),
    });

    if (modoSimulacion()) {
      console.log(`📧 [Simulación] Correo "${asunto}" para ${destinatarios.join(', ')}`);
    }
    return { enviado: true, simulado: modoSimulacion(), destinatarios, id: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error.message);
    return { enviado: false, simulado: modoSimulacion(), error: error.message };
  }
};
