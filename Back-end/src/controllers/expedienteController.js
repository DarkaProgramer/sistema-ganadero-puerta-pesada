// expedienteController.js — Estatus y expediente individual de empleados (Tarjeta 1)
// No sustituye al CRUD de authController: solo agrega endpoints nuevos.
import prisma from '../config/db.js';
import { isoADate } from '../utils/fechas.js';

export const ESTATUS_EMPLEADO = ['Activo', 'Inactivo', 'Vacaciones'];

// Sin la contraseña
const camposPublicos = {
  idEmpleado: true, nombreCompleto: true, correo: true, rol: true, telefono: true, idPuesto: true,
  estatus: true, fechaContratacion: true, direccion: true, contactoEmergencia: true, notas: true,
  puestoRelacion: true,
};

// GET /api/empleados/resumen-estatus — conteo por estatus para los filtros
export const resumenEstatus = async (req, res) => {
  try {
    const grupos = await prisma.empleado.groupBy({ by: ['estatus'], _count: { _all: true } });
    const resumen = Object.fromEntries(ESTATUS_EMPLEADO.map(e => [e, 0]));
    grupos.forEach(g => { resumen[g.estatus] = g._count._all; });
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el resumen de estatus', details: error.message });
  }
};

// PATCH /api/empleados/:id/estatus  { estatus }
export const cambiarEstatus = async (req, res) => {
  try {
    const { estatus } = req.body;
    if (!ESTATUS_EMPLEADO.includes(estatus)) {
      return res.status(400).json({ error: `Estatus inválido. Usa: ${ESTATUS_EMPLEADO.join(', ')}` });
    }
    const empleado = await prisma.empleado.update({
      where: { idEmpleado: Number(req.params.id) },
      data: { estatus },
      select: camposPublicos,
    });
    res.json({ message: `Estatus actualizado a ${estatus}`, empleado });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar el estatus', details: error.message });
  }
};

// GET /api/empleados/:id/expediente — ficha completa con historial de actividades
export const obtenerExpediente = async (req, res) => {
  try {
    const idEmpleado = Number(req.params.id);
    const empleado = await prisma.empleado.findUnique({
      where: { idEmpleado },
      select: {
        ...camposPublicos,
        asignacionesCorral: { include: { corral: true }, orderBy: { fechaAsignacion: 'desc' } },
      },
    });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    const [controles, movimientos, reportes, eventos, transacciones] = await Promise.all([
      prisma.controlSanitario.findMany({
        where: { responsable: idEmpleado },
        include: { corral: true, _count: { select: { tratamientos: true } } },
        orderBy: { fecha: 'desc' }, take: 50,
      }),
      prisma.movimientoInventario.findMany({
        where: { idEmpleado },
        include: { inventario: { select: { nombre: true, unidad: true, tipo: true } } },
        orderBy: { fecha: 'desc' }, take: 50,
      }),
      prisma.reporte.findMany({ where: { idEmpleado }, orderBy: { fecha: 'desc' }, take: 50,
        select: { idReporte: true, titulo: true, tipoIncidencia: true, estado: true, fecha: true } }),
      prisma.evento.findMany({ where: { idEmpleado }, orderBy: { fecha: 'desc' }, take: 50 }),
      prisma.transaccion.findMany({ where: { idEmpleado }, orderBy: { fecha: 'desc' }, take: 50,
        select: { idTransaccion: true, folio: true, tipo: true, total: true, fecha: true, estado: true } }),
    ]);

    // Línea de tiempo unificada de actividades
    const actividades = [
      ...controles.map(c => ({
        tipo: 'Salud', fecha: c.fecha,
        titulo: `${c.tipo}: ${c.producto}`,
        detalle: `${c.corral ? `Corral ${c.corral.nombre} · ` : ''}${c._count.tratamientos} animales`,
      })),
      ...movimientos.map(m => ({
        tipo: 'Inventario', fecha: m.fecha,
        titulo: `${m.tipoMovimiento} de ${m.inventario?.nombre ?? 'artículo'}`,
        detalle: `${m.cantidad} ${m.inventario?.unidad ?? ''}${m.motivo ? ` · ${m.motivo}` : ''}${m.estadoPrestamo ? ` · ${m.estadoPrestamo}` : ''}`,
      })),
      ...reportes.map(r => ({
        tipo: 'Incidencia', fecha: r.fecha,
        titulo: r.titulo, detalle: `${r.tipoIncidencia} · ${r.estado}`,
      })),
      ...eventos.map(e => ({
        tipo: 'Agenda', fecha: e.fecha,
        titulo: e.titulo || e.tipo, detalle: e.descripcion,
      })),
      ...transacciones.map(t => ({
        tipo: 'Transacción', fecha: t.fecha,
        titulo: `${t.tipo} ${t.folio}`, detalle: `$${Number(t.total).toLocaleString('es-MX')} · ${t.estado}`,
      })),
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json({
      empleado,
      actividades,
      estadisticas: {
        controlesSanitarios: controles.length,
        movimientosInventario: movimientos.length,
        incidenciasReportadas: reportes.length,
        prestamosActivos: movimientos.filter(m => m.estadoPrestamo === 'Prestado').length,
        corralesAsignados: empleado.asignacionesCorral.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el expediente', details: error.message });
  }
};

// PUT /api/empleados/:id/expediente — datos de RR.HH. que no maneja el formulario básico
export const actualizarExpediente = async (req, res) => {
  try {
    const { estatus, fechaContratacion, direccion, contactoEmergencia, notas } = req.body;
    if (estatus && !ESTATUS_EMPLEADO.includes(estatus)) {
      return res.status(400).json({ error: 'Estatus inválido' });
    }
    const empleado = await prisma.empleado.update({
      where: { idEmpleado: Number(req.params.id) },
      data: {
        ...(estatus ? { estatus } : {}),
        fechaContratacion: fechaContratacion ? isoADate(fechaContratacion) : null,
        direccion: direccion || null,
        contactoEmergencia: contactoEmergencia || null,
        notas: notas || null,
      },
      select: camposPublicos,
    });
    res.json({ message: 'Expediente actualizado', empleado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el expediente', details: error.message });
  }
};

// POST /api/empleados/:id/corrales  { idCorral, responsabilidad }
export const asignarCorral = async (req, res) => {
  try {
    const idEmpleado = Number(req.params.id);
    const idCorral = Number(req.body.idCorral);
    if (!idCorral) return res.status(400).json({ error: 'Selecciona un corral' });

    const asignacion = await prisma.asignacionCorral.upsert({
      where: { idEmpleado_idCorral: { idEmpleado, idCorral } },
      update: { responsabilidad: req.body.responsabilidad || null },
      create: { idEmpleado, idCorral, responsabilidad: req.body.responsabilidad || null },
      include: { corral: true },
    });
    res.status(201).json({ message: 'Corral asignado', asignacion });
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar el corral', details: error.message });
  }
};

// DELETE /api/empleados/:id/corrales/:idCorral
export const quitarCorral = async (req, res) => {
  try {
    await prisma.asignacionCorral.delete({
      where: { idEmpleado_idCorral: { idEmpleado: Number(req.params.id), idCorral: Number(req.params.idCorral) } },
    });
    res.json({ message: 'Asignación eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al quitar la asignación', details: error.message });
  }
};
