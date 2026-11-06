// prisma/seed-modulos.js — Datos iniciales de los módulos nuevos (Tarjetas 1 a 7).
// Idempotente: se puede correr varias veces. Ejecutar después de `npx prisma db seed`:
//   npm run seed:modulos
import { PrismaClient } from '@prisma/client';
import { ETAPAS_POR_DEFECTO } from '../src/utils/etapas.js';

const prisma = new PrismaClient();
const normalizar = (t = '') => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const hoyUTC = () => new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
const enDias = (d) => { const f = hoyUTC(); f.setUTCDate(f.getUTCDate() + d); return f; };

async function main() {
  console.log('🌱 Precargando datos de los módulos nuevos...');

  // ── Tarjeta 7: etapas por especie ──
  for (const tipo of await prisma.tipoAnimal.findMany({ include: { _count: { select: { etapas: true } } } })) {
    const plantilla = ETAPAS_POR_DEFECTO[normalizar(tipo.nombre)];
    if (tipo._count.etapas || !plantilla) continue;
    await prisma.etapaDesarrollo.createMany({ data: plantilla.map((e, i) => ({ ...e, orden: i, idTipoAnimal: tipo.idTipoAnimal })) });
  }

  const admin = await prisma.empleado.findUnique({ where: { correo: 'admin@rancho.com' } });
  const empleado = await prisma.empleado.findUnique({ where: { correo: 'empleado@rancho.com' } });
  if (!admin || !empleado) {
    console.log('⚠️  Corre primero `npx prisma db seed` para crear los usuarios de prueba.');
    return;
  }

  // ── Tarjeta 1: expediente y corrales asignados ──
  await prisma.empleado.update({ where: { idEmpleado: empleado.idEmpleado }, data: {
    fechaContratacion: empleado.fechaContratacion ?? new Date('2024-02-01T00:00:00.000Z'),
    contactoEmergencia: empleado.contactoEmergencia ?? 'María Pérez — 4440000099',
  } });
  const corral = await prisma.corral.findFirst({ where: { nombre: 'Corral 1 - Engorda' } });
  if (corral) {
    await prisma.asignacionCorral.upsert({
      where: { idEmpleado_idCorral: { idEmpleado: empleado.idEmpleado, idCorral: corral.idCorral } },
      update: {},
      create: { idEmpleado: empleado.idEmpleado, idCorral: corral.idCorral, responsabilidad: 'Alimentación y limpieza' },
    });
  }

  // ── Tarjeta 2: inventario diferenciado ──
  const articulos = [
    { nombre: 'Pinzas aretadoras', tipo: 'Herramienta', categoria: 'Manejo', cantidadActual: 3, unidad: 'pieza', stockMinimo: 2, stockCritico: 1, ubicacion: 'Bodega principal' },
    { nombre: 'Motosierra Stihl', tipo: 'Herramienta', categoria: 'Mantenimiento', cantidadActual: 1, unidad: 'pieza', stockMinimo: 1, stockCritico: 0, ubicacion: 'Taller' },
    { nombre: 'Jeringa automática 50 ml', tipo: 'Herramienta', categoria: 'Veterinaria', cantidadActual: 4, unidad: 'pieza', stockMinimo: 2, stockCritico: 1, ubicacion: 'Botiquín' },
    { nombre: 'Ivermectina 1%', tipo: 'Consumible', categoria: 'Medicamento', cantidadActual: 2, unidad: 'frasco', stockMinimo: 5, stockCritico: 2, ubicacion: 'Botiquín' },
    { nombre: 'Bobact 8', tipo: 'Consumible', categoria: 'Medicamento', cantidadActual: 6, unidad: 'frasco', stockMinimo: 4, stockCritico: 2, ubicacion: 'Refrigerador' },
    { nombre: 'Alimento concentrado', tipo: 'Consumible', categoria: 'Alimento', cantidadActual: 40, unidad: 'bulto', stockMinimo: 25, stockCritico: 10, ubicacion: 'Bodega de forrajes' },
    { nombre: 'Pacas de alfalfa', tipo: 'Consumible', categoria: 'Alimento', cantidadActual: 18, unidad: 'paca', stockMinimo: 30, stockCritico: 15, ubicacion: 'Bodega de forrajes' },
  ];
  for (const a of articulos) {
    const existe = await prisma.inventario.findFirst({ where: { nombre: a.nombre } });
    if (!existe) await prisma.inventario.create({ data: a });
  }

  // ── Tarjeta 3: proveedor de ejemplo ──
  if (!(await prisma.proveedor.findFirst({ where: { nombre: 'Agro-Norte Chihuahua' } }))) {
    await prisma.proveedor.create({ data: { nombre: 'Agro-Norte Chihuahua', telefono: '6140000000', correo: 'ventas@agronorte.mx' } });
  }
  if (!(await prisma.cliente.findFirst({ where: { nomCliente: 'Carnicerías El Norte' } }))) {
    await prisma.cliente.create({ data: { nomCliente: 'Carnicerías El Norte', telefono: '6140000001' } });
  }

  // ── Tarjeta 4: evento repetible (pago a empleados cada sábado) ──
  if (!(await prisma.evento.findFirst({ where: { titulo: 'Pago a empleados' } }))) {
    const sabado = hoyUTC();
    sabado.setUTCDate(sabado.getUTCDate() + ((6 - sabado.getUTCDay() + 7) % 7));
    await prisma.evento.create({ data: {
      idEmpleado: admin.idEmpleado, titulo: 'Pago a empleados', tipo: 'Pago', fecha: sabado,
      hora: new Date('1970-01-01T09:00:00.000Z'), descripcion: 'Pago semanal de nómina al personal del rancho.',
      estado: 'Programado', recurrencia: 'Semanal', diasSemana: '6', notificarCorreo: true,
    } });
    await prisma.evento.create({ data: {
      idEmpleado: admin.idEmpleado, titulo: 'Revisión de cercas', tipo: 'Mantenimiento', fecha: enDias(2),
      descripcion: 'Revisar los tramos dañados del corral de engorda.', estado: 'Programado',
    } });
  }

  // ── Tarjeta 5: vehículo y una incidencia de ejemplo ──
  let ranger = await prisma.equipo.findFirst({ where: { nombre: 'Ford Ranger' } });
  if (!ranger) ranger = await prisma.equipo.create({ data: { nombre: 'Ford Ranger', categoria: 'Vehículo', estado: 'Operativo' } });
  await prisma.equipo.findFirst({ where: { nombre: 'Tractor John Deere' } })
    || await prisma.equipo.create({ data: { nombre: 'Tractor John Deere', categoria: 'Maquinaria', estado: 'Operativo' } });
  if (!(await prisma.reporte.count())) {
    await prisma.reporte.create({ data: {
      idEmpleado: empleado.idEmpleado, categoriaReporte: 'Equipo', tipoIncidencia: 'Daño en vehículo/maquinaria',
      titulo: 'Llanta baja en la Ford Ranger', descripcion: 'La llanta trasera derecha pierde aire, se infló pero vuelve a bajar.',
      prioridad: 'Media', idEquipoAfectado: ranger.idEquipo,
    } });
  }

  console.log('✅ Módulos precargados (etapas, inventario, proveedor, agenda, incidencias).');
}

main()
  .catch((e) => { console.error('❌ Error en seed de módulos:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
