// notificacionController.js — Campanita y centro de notificaciones (Tarjeta 6)
import prisma from '../config/db.js';
import { sincronizarNotificaciones } from '../services/notificacionService.js';

// GET /api/notificaciones?estado=todas|noLeidas&tipo=&limite=
export const obtenerNotificaciones = async (req, res) => {
  try {
    await sincronizarNotificaciones({ forzar: req.query.refrescar === '1' });
    const { estado, tipo } = req.query;
    const limite = Math.min(500, Number(req.query.limite) || 200);
    const where = {
      eliminada: false,
      ...(estado === 'noLeidas' ? { leida: false } : {}),
      ...(tipo ? { tipo } : {}),
    };
    const [notificaciones, noLeidas] = await Promise.all([
      prisma.notificacion.findMany({ where, orderBy: [{ leida: 'asc' }, { fecha: 'desc' }], take: limite }),
      prisma.notificacion.count({ where: { eliminada: false, leida: false } }),
    ]);
    res.json({ notificaciones, noLeidas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones', details: error.message });
  }
};

// PATCH /api/notificaciones/:id { leida }
export const marcarLeida = async (req, res) => {
  try {
    const notificacion = await prisma.notificacion.update({
      where: { idNotificacion: Number(req.params.id) },
      data: { leida: req.body.leida !== false },
    });
    res.json({ notificacion });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la notificación', details: error.message });
  }
};

// PATCH /api/notificaciones/leer-todas
export const marcarTodasLeidas = async (req, res) => {
  try {
    const { count } = await prisma.notificacion.updateMany({ where: { leida: false, eliminada: false }, data: { leida: true } });
    res.json({ message: `${count} notificaciones marcadas como leídas` });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificaciones', details: error.message });
  }
};

// DELETE /api/notificaciones/:id — borrado lógico para que no se regenere
export const eliminarNotificacion = async (req, res) => {
  try {
    await prisma.notificacion.update({ where: { idNotificacion: Number(req.params.id) }, data: { eliminada: true, leida: true } });
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la notificación', details: error.message });
  }
};

// DELETE /api/notificaciones?soloLeidas=1
export const eliminarVarias = async (req, res) => {
  try {
    const { count } = await prisma.notificacion.updateMany({
      where: { eliminada: false, ...(req.query.soloLeidas === '1' ? { leida: true } : {}) },
      data: { eliminada: true, leida: true },
    });
    res.json({ message: `${count} notificaciones eliminadas` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar notificaciones', details: error.message });
  }
};
