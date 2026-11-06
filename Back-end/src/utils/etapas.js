// utils/etapas.js — Cálculo automático de la etapa de desarrollo (Tarjeta 7)
import prisma from '../config/db.js';

// Parámetros por defecto por especie (en meses). mesFin es exclusivo; null = sin límite.
export const ETAPAS_POR_DEFECTO = {
  bovino: [
    { nombre: 'Cría',       mesInicio: 0,  mesFin: 6,    color: 'sky' },
    { nombre: 'Destete',    mesInicio: 6,  mesFin: 9,    color: 'amber' },
    { nombre: 'Desarrollo', mesInicio: 9,  mesFin: 18,   color: 'emerald' },
    { nombre: 'Engorda',    mesInicio: 18, mesFin: null, color: 'rose' },
  ],
  equino: [
    { nombre: 'Potrillo', mesInicio: 0,  mesFin: 6,    color: 'sky' },
    { nombre: 'Destete',  mesInicio: 6,  mesFin: 12,   color: 'amber' },
    { nombre: 'Potro',    mesInicio: 12, mesFin: 36,   color: 'emerald' },
    { nombre: 'Adulto',   mesInicio: 36, mesFin: null, color: 'violet' },
  ],
  ovino: [
    { nombre: 'Cordero',    mesInicio: 0,  mesFin: 3,    color: 'sky' },
    { nombre: 'Destete',    mesInicio: 3,  mesFin: 6,    color: 'amber' },
    { nombre: 'Desarrollo', mesInicio: 6,  mesFin: 12,   color: 'emerald' },
    { nombre: 'Adulto',     mesInicio: 12, mesFin: null, color: 'violet' },
  ],
  caprino: [
    { nombre: 'Cabrito',    mesInicio: 0,  mesFin: 3,    color: 'sky' },
    { nombre: 'Destete',    mesInicio: 3,  mesFin: 6,    color: 'amber' },
    { nombre: 'Desarrollo', mesInicio: 6,  mesFin: 12,   color: 'emerald' },
    { nombre: 'Adulto',     mesInicio: 12, mesFin: null, color: 'violet' },
  ],
  porcino: [
    { nombre: 'Lechón',      mesInicio: 0, mesFin: 1,    color: 'sky' },
    { nombre: 'Destete',     mesInicio: 1, mesFin: 2,    color: 'amber' },
    { nombre: 'Crecimiento', mesInicio: 2, mesFin: 4,    color: 'emerald' },
    { nombre: 'Engorda',     mesInicio: 4, mesFin: null, color: 'rose' },
  ],
};

const normalizar = (txt = '') => txt.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Crea las etapas por defecto para los tipos de animal que todavía no tienen ninguna
export const asegurarEtapasPorDefecto = async () => {
  const tipos = await prisma.tipoAnimal.findMany({ include: { _count: { select: { etapas: true } } } });
  for (const tipo of tipos) {
    if (tipo._count.etapas > 0) continue;
    const plantilla = ETAPAS_POR_DEFECTO[normalizar(tipo.nombre)];
    if (!plantilla) continue;
    await prisma.etapaDesarrollo.createMany({
      data: plantilla.map((e, i) => ({ ...e, orden: i, idTipoAnimal: tipo.idTipoAnimal })),
    });
  }
};

// Meses cumplidos entre la fecha de nacimiento y una fecha de referencia
export const mesesCumplidos = (fechaNacimiento, referencia = new Date()) => {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento);
  const ref = new Date(referencia);
  let meses = (ref.getUTCFullYear() - nac.getUTCFullYear()) * 12 + (ref.getUTCMonth() - nac.getUTCMonth());
  if (ref.getUTCDate() < nac.getUTCDate()) meses -= 1;
  return Math.max(0, meses);
};

const sumarMeses = (fecha, meses) => {
  const d = new Date(fecha);
  d.setUTCMonth(d.getUTCMonth() + meses);
  return d;
};

/**
 * Calcula la etapa actual de un animal a partir de su fecha de nacimiento y las etapas de su especie.
 * Devuelve null si el animal no tiene fecha de nacimiento o su especie no tiene etapas.
 */
export const calcularEtapa = (fechaNacimiento, etapas, referencia = new Date()) => {
  const edadMeses = mesesCumplidos(fechaNacimiento, referencia);
  if (edadMeses === null || !etapas?.length) return null;

  const ordenadas = [...etapas].sort((a, b) => a.mesInicio - b.mesInicio);
  let indice = ordenadas.findIndex(e => edadMeses >= e.mesInicio && (e.mesFin == null || edadMeses < e.mesFin));
  // Si la edad queda fuera de los rangos (huecos en la configuración) se toma la última etapa alcanzada
  if (indice === -1) {
    indice = ordenadas.reduce((acc, e, i) => (edadMeses >= e.mesInicio ? i : acc), 0);
  }

  const actual = ordenadas[indice];
  const siguiente = ordenadas[indice + 1] || null;
  const fechaInicioEtapa = sumarMeses(fechaNacimiento, actual.mesInicio);
  const fechaProximaEtapa = siguiente ? sumarMeses(fechaNacimiento, siguiente.mesInicio) : null;

  let progreso = 100;
  if (actual.mesFin != null) {
    const total = sumarMeses(fechaNacimiento, actual.mesFin) - fechaInicioEtapa;
    progreso = Math.min(100, Math.max(0, Math.round(((new Date(referencia) - fechaInicioEtapa) / total) * 100)));
  }

  const diasParaSiguiente = fechaProximaEtapa
    ? Math.ceil((fechaProximaEtapa - new Date(referencia)) / (1000 * 60 * 60 * 24))
    : null;

  return {
    edadMeses,
    etapa: actual,
    indice,
    siguiente,
    progreso,
    fechaInicioEtapa,
    fechaProximaEtapa,
    diasParaSiguiente,
    etapas: ordenadas,
  };
};

// Etapa actual de un animal concreto (lee sus etapas de la BD)
export const calcularEtapaDeAnimal = async (idAnimal) => {
  const animal = await prisma.animal.findUnique({
    where: { idAnimal: Number(idAnimal) },
    select: { idAnimal: true, fechaNacimiento: true, idTipoAnimal: true },
  });
  if (!animal) return null;
  await asegurarEtapasPorDefecto();
  const etapas = await prisma.etapaDesarrollo.findMany({ where: { idTipoAnimal: animal.idTipoAnimal } });
  return calcularEtapa(animal.fechaNacimiento, etapas);
};
