// incidenciaController.js — Reportes internos de empleados (Tarjeta 5). Usa el modelo Reporte existente.
import prisma from '../config/db.js';

export const TIPOS_INCIDENCIA = ['Animal lesionado', 'Daño en vehículo/maquinaria', 'Aviso general'];
export const ESTADOS_INCIDENCIA = ['Pendiente', 'En revisión', 'Atendido', 'Descartado'];
const PRIORIDADES = ['Baja', 'Media', 'Alta'];

// Mapea el tipo de incidencia a la categoría original del modelo Reporte
const categoriaDeTipo = (tipo) => ({
  'Animal lesionado': 'Animal',
  'Daño en vehículo/maquinaria': 'Equipo',
}[tipo] || 'General');

const MAX_FOTO = 3 * 1024 * 1024; // ~3 MB en base64

// Agrega los datos del animal/equipo afectado (el modelo guarda solo los IDs)
const enriquecer = async (reportes) => {
  const idsAnimal = [...new Set(reportes.map(r => r.idAnimalAfectado).filter(Boolean))];
  const idsEquipo = [...new Set(reportes.map(r => r.idEquipoAfectado).filter(Boolean))];
  const [animales, equipos] = await Promise.all([
    idsAnimal.length ? prisma.animal.findMany({ where: { idAnimal: { in: idsAnimal } }, select: { idAnimal: true, areteBandera: true, nombre: true } }) : [],
    idsEquipo.length ? prisma.equipo.findMany({ where: { idEquipo: { in: idsEquipo } } }) : [],
  ]);
  return reportes.map(r => ({
    ...r,
    animal: animales.find(a => a.idAnimal === r.idAnimalAfectado) || null,
    equipo: equipos.find(e => e.idEquipo === r.idEquipoAfectado) || null,
  }));
};

// GET /api/incidencias/catalogos — opciones del formulario rápido
export const obtenerCatalogos = async (req, res) => {
  try {
    const [animales, equipos] = await Promise.all([
      prisma.animal.findMany({ where: { estado: 'Vivo' }, select: { idAnimal: true, areteBandera: true, nombre: true }, orderBy: { areteBandera: 'asc' } }),
      prisma.equipo.findMany({ orderBy: { nombre: 'asc' } }),
    ]);
    res.json({ tipos: TIPOS_INCIDENCIA, estados: ESTADOS_INCIDENCIA, prioridades: PRIORIDADES, animales, equipos });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener catálogos', details: error.message });
  }
};

// POST /api/incidencias/equipos { nombre, categoria } — alta rápida de vehículos/maquinaria
export const crearEquipo = async (req, res) => {
  try {
    if (!req.body.nombre?.trim()) return res.status(400).json({ error: 'El nombre del equipo es obligatorio' });
    const equipo = await prisma.equipo.create({
      data: { nombre: req.body.nombre.trim(), categoria: req.body.categoria || 'Vehículo', estado: req.body.estado || 'Operativo' },
    });
    res.status(201).json({ message: 'Equipo registrado', equipo });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el equipo', details: error.message });
  }
};

// GET /api/incidencias?estado=&tipo=&idEmpleado=&conFoto=0
export const obtenerIncidencias = async (req, res) => {
  try {
    const { estado, tipo, idEmpleado } = req.query;
    const reportes = await prisma.reporte.findMany({
      where: {
        ...(estado ? { estado } : {}),
        ...(tipo ? { tipoIncidencia: tipo } : {}),
        ...(idEmpleado ? { idEmpleado: Number(idEmpleado) } : {}),
      },
      include: { empleado: { select: { idEmpleado: true, nombreCompleto: true, puestoRelacion: { select: { nombre: true } } } } },
      orderBy: { fecha: 'desc' },
    });
    res.json(await enriquecer(reportes));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener incidencias', details: error.message });
  }
};

// GET /api/incidencias/resumen
export const resumenIncidencias = async (req, res) => {
  try {
    const grupos = await prisma.reporte.groupBy({ by: ['estado'], _count: { _all: true } });
    const resumen = Object.fromEntries(ESTADOS_INCIDENCIA.map(e => [e, 0]));
    grupos.forEach(g => { resumen[g.estado] = g._count._all; });
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el resumen', details: error.message });
  }
};

// POST /api/incidencias — reporte rápido del empleado
export const crearIncidencia = async (req, res) => {
  try {
    const { idEmpleado, tipoIncidencia, titulo, descripcion, prioridad, idAnimalAfectado, idEquipoAfectado, fotoUrl } = req.body;
    if (!idEmpleado) return res.status(400).json({ error: 'No se identificó al empleado que reporta' });
    if (!TIPOS_INCIDENCIA.includes(tipoIncidencia)) return res.status(400).json({ error: 'Tipo de incidencia inválido' });
    if (!descripcion?.trim()) return res.status(400).json({ error: 'Describe lo que ocurrió' });
    if (fotoUrl && (!String(fotoUrl).startsWith('data:image/') || fotoUrl.length > MAX_FOTO)) {
      return res.status(400).json({ error: 'La foto debe ser una imagen de máximo ~2 MB' });
    }

    const reporte = await prisma.reporte.create({
      data: {
        idEmpleado: Number(idEmpleado),
        categoriaReporte: categoriaDeTipo(tipoIncidencia),
        tipoIncidencia,
        titulo: (titulo?.trim() || tipoIncidencia).slice(0, 100),
        descripcion: descripcion.trim(),
        prioridad: PRIORIDADES.includes(prioridad) ? prioridad : 'Media',
        idAnimalAfectado: idAnimalAfectado ? Number(idAnimalAfectado) : null,
        idEquipoAfectado: idEquipoAfectado ? Number(idEquipoAfectado) : null,
        fotoUrl: fotoUrl || null,
      },
      include: { empleado: { select: { nombreCompleto: true } } },
    });
    res.status(201).json({ message: 'Reporte enviado. El administrador lo revisará.', reporte });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el reporte', details: error.message });
  }
};

// PATCH /api/incidencias/:id { estado, respuesta, atendidoPor } — panel del administrador
export const atenderIncidencia = async (req, res) => {
  try {
    const { estado, respuesta, atendidoPor } = req.body;
    if (estado && !ESTADOS_INCIDENCIA.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
    const cerrada = estado === 'Atendido' || estado === 'Descartado';
    const reporte = await prisma.reporte.update({
      where: { idReporte: Number(req.params.id) },
      data: {
        ...(estado ? { estado } : {}),
        ...(respuesta !== undefined ? { respuesta: respuesta || null } : {}),
        ...(atendidoPor ? { atendidoPor } : {}),
        ...(cerrada ? { fechaAtencion: new Date() } : {}),
      },
    });
    // La notificación de una incidencia ya revisada deja de tener sentido
    if (estado && estado !== 'Pendiente') {
      await prisma.notificacion.updateMany({ where: { clave: `incidencia-${reporte.idReporte}` }, data: { leida: true } });
    }
    res.json({ message: `Incidencia marcada como ${reporte.estado}`, reporte });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la incidencia', details: error.message });
  }
};

// DELETE /api/incidencias/:id
export const eliminarIncidencia = async (req, res) => {
  try {
    await prisma.reporte.delete({ where: { idReporte: Number(req.params.id) } });
    res.json({ message: 'Incidencia eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la incidencia', details: error.message });
  }
};
