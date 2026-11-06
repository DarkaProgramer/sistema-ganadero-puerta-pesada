// etapaController.js — Parámetros de etapas por tipo de animal y cálculo automático (Tarjeta 7)
import prisma from '../config/db.js';
import { asegurarEtapasPorDefecto, calcularEtapa, calcularEtapaDeAnimal, ETAPAS_POR_DEFECTO } from '../utils/etapas.js';

const COLORES = ['sky', 'amber', 'emerald', 'rose', 'violet', 'slate', 'orange', 'teal'];

// GET /api/etapas — tipos de animal con sus etapas
export const obtenerEtapas = async (req, res) => {
  try {
    await asegurarEtapasPorDefecto();
    const tipos = await prisma.tipoAnimal.findMany({
      include: { etapas: { orderBy: { mesInicio: 'asc' } } },
      orderBy: { idTipoAnimal: 'asc' },
    });
    res.json(tipos.map(t => ({ idTipoAnimal: t.idTipoAnimal, nombre: t.nombre, activo: t.activo, etapas: t.etapas })));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las etapas', details: error.message });
  }
};

/**
 * PUT /api/etapas/tipo/:idTipoAnimal { etapas: [{ nombre, mesInicio, mesFin, color }] }
 * Reemplaza la configuración completa de un tipo. Valida que los rangos sean continuos.
 */
export const guardarEtapasDeTipo = async (req, res) => {
  try {
    const idTipoAnimal = Number(req.params.idTipoAnimal);
    const etapas = [...(req.body.etapas || [])]
      .map(e => ({
        nombre: String(e.nombre || '').trim(),
        mesInicio: Number(e.mesInicio),
        mesFin: e.mesFin === '' || e.mesFin === null || e.mesFin === undefined ? null : Number(e.mesFin),
        color: COLORES.includes(e.color) ? e.color : 'emerald',
      }))
      .sort((a, b) => a.mesInicio - b.mesInicio);

    if (!etapas.length) return res.status(400).json({ error: 'Define al menos una etapa' });
    if (etapas[0].mesInicio !== 0) return res.status(400).json({ error: 'La primera etapa debe iniciar en el mes 0' });
    for (let i = 0; i < etapas.length; i++) {
      const e = etapas[i];
      if (!e.nombre) return res.status(400).json({ error: 'Todas las etapas necesitan nombre' });
      if (!Number.isInteger(e.mesInicio) || e.mesInicio < 0) return res.status(400).json({ error: `"${e.nombre}": mes de inicio inválido` });
      const esUltima = i === etapas.length - 1;
      if (!esUltima) {
        if (e.mesFin == null) return res.status(400).json({ error: `"${e.nombre}": solo la última etapa puede quedar sin mes final` });
        if (e.mesFin <= e.mesInicio) return res.status(400).json({ error: `"${e.nombre}": el mes final debe ser mayor al inicial` });
        if (e.mesFin !== etapas[i + 1].mesInicio) {
          return res.status(400).json({ error: `"${e.nombre}" termina en el mes ${e.mesFin} pero "${etapas[i + 1].nombre}" inicia en el ${etapas[i + 1].mesInicio}. Los rangos deben ser continuos.` });
        }
      } else if (e.mesFin != null && e.mesFin <= e.mesInicio) {
        return res.status(400).json({ error: `"${e.nombre}": el mes final debe ser mayor al inicial` });
      }
    }

    await prisma.$transaction([
      prisma.etapaDesarrollo.deleteMany({ where: { idTipoAnimal } }),
      prisma.etapaDesarrollo.createMany({ data: etapas.map((e, i) => ({ ...e, orden: i, idTipoAnimal })) }),
    ]);
    const guardadas = await prisma.etapaDesarrollo.findMany({ where: { idTipoAnimal }, orderBy: { mesInicio: 'asc' } });
    res.json({ message: 'Etapas guardadas', etapas: guardadas });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar las etapas', details: error.message });
  }
};

// GET /api/etapas/plantillas — valores sugeridos por especie
export const obtenerPlantillas = (req, res) => res.json(ETAPAS_POR_DEFECTO);

// GET /api/etapas/animal/:id — etapa actual calculada de un animal
export const etapaDeAnimal = async (req, res) => {
  try {
    const info = await calcularEtapaDeAnimal(req.params.id);
    res.json(info || { sinDatos: true, motivo: 'El animal no tiene fecha de nacimiento o su especie no tiene etapas configuradas.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular la etapa', details: error.message });
  }
};

// GET /api/etapas/animales — etapa actual de todos los animales vivos { idAnimal: { nombre, color, edadMeses } }
export const etapasDeAnimales = async (req, res) => {
  try {
    await asegurarEtapasPorDefecto();
    const animales = await prisma.animal.findMany({
      where: { estado: 'Vivo' },
      select: { idAnimal: true, fechaNacimiento: true, tipoAnimal: { select: { etapas: true } } },
    });
    const mapa = {};
    for (const a of animales) {
      const info = calcularEtapa(a.fechaNacimiento, a.tipoAnimal.etapas);
      if (info) mapa[a.idAnimal] = { nombre: info.etapa.nombre, color: info.etapa.color, edadMeses: info.edadMeses };
    }
    res.json(mapa);
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular las etapas', details: error.message });
  }
};
