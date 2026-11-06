// inventarioController.js — Inventario diferenciado Herramientas vs. Consumibles (Tarjeta 2)
import prisma from '../config/db.js';
import { isoADate, hoyISO } from '../utils/fechas.js';

export const TIPOS_INVENTARIO = ['Herramienta', 'Consumible'];

// Nivel de stock: 'critico' (rojo) <= stockCritico, 'bajo' (amarillo) <= stockMinimo, 'ok' (verde)
export const nivelStock = (item) => {
  if (item.cantidadActual <= item.stockCritico) return 'critico';
  if (item.cantidadActual <= item.stockMinimo) return 'bajo';
  return 'ok';
};

const conNivel = (item) => ({
  ...item,
  nivel: nivelStock(item),
  prestados: item.movimientos
    ? item.movimientos.filter(m => m.estadoPrestamo === 'Prestado').reduce((s, m) => s + m.cantidad, 0)
    : undefined,
  movimientos: undefined,
});

// Primer administrador como respaldo cuando no llega idEmpleado
const empleadoORespaldo = async (idEmpleado) => {
  if (idEmpleado) return Number(idEmpleado);
  const admin = await prisma.empleado.findFirst({ where: { rol: { in: ['Administrador', 'administrador'] } } });
  return admin?.idEmpleado ?? null;
};

const validarUmbrales = (stockMinimo, stockCritico) => {
  if (stockMinimo < 0 || stockCritico < 0) return 'Los umbrales no pueden ser negativos.';
  if (stockCritico > stockMinimo) return 'El umbral crítico debe ser menor o igual al stock mínimo.';
  return null;
};

// GET /api/inventario?tipo=Herramienta&nivel=critico&q=texto
export const obtenerInventario = async (req, res) => {
  try {
    const { tipo, nivel, q } = req.query;
    const items = await prisma.inventario.findMany({
      where: {
        activo: true,
        ...(tipo ? { tipo } : {}),
        ...(q ? { nombre: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: { movimientos: { where: { estadoPrestamo: 'Prestado' }, select: { cantidad: true, estadoPrestamo: true } } },
      orderBy: { nombre: 'asc' },
    });
    let resultado = items.map(conNivel);
    if (nivel) resultado = resultado.filter(i => i.nivel === nivel);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el inventario', details: error.message });
  }
};

// GET /api/inventario/resumen
export const resumenInventario = async (req, res) => {
  try {
    const items = (await prisma.inventario.findMany({ where: { activo: true } })).map(i => ({ ...i, nivel: nivelStock(i) }));
    const prestamosActivos = await prisma.movimientoInventario.count({ where: { estadoPrestamo: 'Prestado' } });
    res.json({
      total: items.length,
      herramientas: items.filter(i => i.tipo === 'Herramienta').length,
      consumibles: items.filter(i => i.tipo === 'Consumible').length,
      criticos: items.filter(i => i.nivel === 'critico').length,
      bajos: items.filter(i => i.nivel === 'bajo').length,
      prestamosActivos,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el resumen', details: error.message });
  }
};

// POST /api/inventario
export const crearArticulo = async (req, res) => {
  try {
    const { nombre, tipo, categoria, cantidadActual, unidad, stockMinimo, stockCritico, ubicacion, descripcion } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!TIPOS_INVENTARIO.includes(tipo)) return res.status(400).json({ error: 'Tipo inválido (Herramienta o Consumible)' });

    const minimo = Number(stockMinimo) || 0;
    const critico = Number(stockCritico) || 0;
    const errorUmbral = validarUmbrales(minimo, critico);
    if (errorUmbral) return res.status(400).json({ error: errorUmbral });

    const item = await prisma.inventario.create({
      data: {
        nombre: nombre.trim(), tipo,
        categoria: categoria || (tipo === 'Herramienta' ? 'Herramienta' : 'Insumo'),
        cantidadActual: Math.max(0, Number(cantidadActual) || 0),
        unidad: unidad || 'pieza',
        stockMinimo: minimo, stockCritico: critico,
        ubicacion: ubicacion || null, descripcion: descripcion || null,
      },
    });
    res.status(201).json({ message: 'Artículo registrado', item: conNivel(item) });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el artículo', details: error.message });
  }
};

// PUT /api/inventario/:id  (no modifica el stock: eso se hace con movimientos)
export const actualizarArticulo = async (req, res) => {
  try {
    const { nombre, tipo, categoria, unidad, stockMinimo, stockCritico, ubicacion, descripcion } = req.body;
    if (tipo && !TIPOS_INVENTARIO.includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
    const minimo = Number(stockMinimo) || 0;
    const critico = Number(stockCritico) || 0;
    const errorUmbral = validarUmbrales(minimo, critico);
    if (errorUmbral) return res.status(400).json({ error: errorUmbral });

    const item = await prisma.inventario.update({
      where: { idInventario: Number(req.params.id) },
      data: { nombre, tipo, categoria, unidad, stockMinimo: minimo, stockCritico: critico,
        ubicacion: ubicacion || null, descripcion: descripcion || null },
    });
    res.json({ message: 'Artículo actualizado', item: conNivel(item) });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el artículo', details: error.message });
  }
};

// PUT /api/inventario/umbrales  { umbrales: [{ idInventario, stockMinimo, stockCritico }] } — sección del administrador
export const actualizarUmbrales = async (req, res) => {
  try {
    const { umbrales = [] } = req.body;
    for (const u of umbrales) {
      const errorUmbral = validarUmbrales(Number(u.stockMinimo), Number(u.stockCritico));
      if (errorUmbral) return res.status(400).json({ error: `Artículo ${u.idInventario}: ${errorUmbral}` });
    }
    await prisma.$transaction(umbrales.map(u => prisma.inventario.update({
      where: { idInventario: Number(u.idInventario) },
      data: { stockMinimo: Number(u.stockMinimo), stockCritico: Number(u.stockCritico) },
    })));
    res.json({ message: `${umbrales.length} umbrales actualizados` });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar los umbrales', details: error.message });
  }
};

// DELETE /api/inventario/:id — baja lógica para conservar el historial
export const eliminarArticulo = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const prestados = await prisma.movimientoInventario.count({ where: { idInventario: id, estadoPrestamo: 'Prestado' } });
    if (prestados > 0) return res.status(400).json({ error: 'No se puede dar de baja: tiene préstamos sin devolver.' });
    await prisma.inventario.update({ where: { idInventario: id }, data: { activo: false } });
    res.json({ message: 'Artículo dado de baja' });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de baja el artículo', details: error.message });
  }
};

/**
 * POST /api/inventario/:id/movimientos  { tipoMovimiento, cantidad, idEmpleado, motivo, fecha }
 *  - Entrada  : aumenta el stock (compra / reabastecimiento / devolución manual)
 *  - Salida   : consumo de un Consumible (medicamento, alimento…)
 *  - Prestamo : préstamo de una Herramienta (descuenta disponible hasta que se devuelva)
 */
export const registrarMovimiento = async (req, res) => {
  try {
    const idInventario = Number(req.params.id);
    const { tipoMovimiento, motivo, fecha } = req.body;
    const cantidad = Number(req.body.cantidad);
    if (!['Entrada', 'Salida', 'Prestamo'].includes(tipoMovimiento)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido (Entrada, Salida o Prestamo)' });
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) return res.status(400).json({ error: 'La cantidad debe ser un entero mayor a 0' });

    const item = await prisma.inventario.findUnique({ where: { idInventario } });
    if (!item || !item.activo) return res.status(404).json({ error: 'Artículo no encontrado' });

    if (tipoMovimiento === 'Salida' && item.tipo === 'Herramienta') {
      return res.status(400).json({ error: 'Las herramientas no se consumen: registra un préstamo.' });
    }
    if (tipoMovimiento === 'Prestamo' && item.tipo !== 'Herramienta') {
      return res.status(400).json({ error: 'Solo las herramientas se pueden prestar: registra una salida por consumo.' });
    }
    if (tipoMovimiento !== 'Entrada' && cantidad > item.cantidadActual) {
      return res.status(400).json({ error: `Stock insuficiente: hay ${item.cantidadActual} ${item.unidad} disponibles.` });
    }

    const idEmpleado = await empleadoORespaldo(req.body.idEmpleado);
    if (!idEmpleado) return res.status(400).json({ error: 'Indica el empleado que realiza el movimiento' });

    const delta = tipoMovimiento === 'Entrada' ? cantidad : -cantidad;
    const [movimiento, actualizado] = await prisma.$transaction([
      prisma.movimientoInventario.create({
        data: {
          idInventario, idEmpleado, tipoMovimiento, cantidad,
          fecha: isoADate(fecha || hoyISO()),
          motivo: motivo || null,
          estadoPrestamo: tipoMovimiento === 'Prestamo' ? 'Prestado' : null,
        },
        include: { empleado: { select: { nombreCompleto: true } } },
      }),
      prisma.inventario.update({ where: { idInventario }, data: { cantidadActual: { increment: delta } } }),
    ]);

    res.status(201).json({ message: 'Movimiento registrado', movimiento, item: conNivel(actualizado) });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el movimiento', details: error.message });
  }
};

// POST /api/inventario/movimientos/:idMovimiento/devolver — devuelve una herramienta prestada
export const devolverPrestamo = async (req, res) => {
  try {
    const idMovimiento = Number(req.params.idMovimiento);
    const prestamo = await prisma.movimientoInventario.findUnique({ where: { idMovimiento } });
    if (!prestamo || prestamo.estadoPrestamo !== 'Prestado') {
      return res.status(400).json({ error: 'El préstamo no existe o ya fue devuelto' });
    }
    const idEmpleado = await empleadoORespaldo(req.body.idEmpleado || prestamo.idEmpleado);
    const hoy = isoADate(hoyISO());

    const [, , actualizado] = await prisma.$transaction([
      prisma.movimientoInventario.update({
        where: { idMovimiento }, data: { estadoPrestamo: 'Devuelto', fechaDevolucion: hoy },
      }),
      prisma.movimientoInventario.create({
        data: { idInventario: prestamo.idInventario, idEmpleado, tipoMovimiento: 'Devolucion',
          cantidad: prestamo.cantidad, fecha: hoy, motivo: req.body.motivo || `Devolución del préstamo #${idMovimiento}` },
      }),
      prisma.inventario.update({
        where: { idInventario: prestamo.idInventario }, data: { cantidadActual: { increment: prestamo.cantidad } },
      }),
    ]);
    res.json({ message: 'Herramienta devuelta', item: conNivel(actualizado) });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la devolución', details: error.message });
  }
};

// GET /api/inventario/movimientos?idInventario=&prestamos=activos
export const obtenerMovimientos = async (req, res) => {
  try {
    const { idInventario, prestamos } = req.query;
    const movimientos = await prisma.movimientoInventario.findMany({
      where: {
        ...(idInventario ? { idInventario: Number(idInventario) } : {}),
        ...(prestamos === 'activos' ? { estadoPrestamo: 'Prestado' } : {}),
      },
      include: {
        inventario: { select: { nombre: true, unidad: true, tipo: true } },
        empleado: { select: { idEmpleado: true, nombreCompleto: true } },
      },
      orderBy: [{ fecha: 'desc' }, { idMovimiento: 'desc' }],
      take: 200,
    });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los movimientos', details: error.message });
  }
};
