// transaccionController.js — Ventas y compras de ganado, insumos y herramientas (Tarjeta 3)
import prisma from '../config/db.js';
import { isoADate, hoyISO } from '../utils/fechas.js';

const TIPOS = ['Compra', 'Venta'];
const ESTADOS = ['Pagado', 'Pendiente', 'Cancelado'];
const CONCEPTOS = ['Animal', 'Insumo', 'Herramienta', 'Otro'];

const incluirCompleto = {
  cliente: true,
  proveedor: true,
  empleado: { select: { idEmpleado: true, nombreCompleto: true } },
  detalles: {
    include: {
      animal: { select: { idAnimal: true, areteBandera: true, nombre: true, genero: true, estado: true,
        raza: { select: { nombre: true } }, tipoAnimal: { select: { nombre: true } } } },
      inventario: { select: { idInventario: true, nombre: true, unidad: true, tipo: true } },
    },
  },
};

// Error de negocio que se devuelve con 400
class ErrorNegocio extends Error {}

const generarFolio = async (tx, tipo, fecha) => {
  const prefijo = `${tipo === 'Venta' ? 'VT' : 'CP'}-${new Date(fecha).getUTCFullYear()}-`;
  const ultima = await tx.transaccion.findFirst({
    where: { folio: { startsWith: prefijo } }, orderBy: { folio: 'desc' }, select: { folio: true },
  });
  const siguiente = ultima ? Number(ultima.folio.slice(prefijo.length)) + 1 : 1;
  return `${prefijo}${String(siguiente).padStart(4, '0')}`;
};

const empleadoORespaldo = async (tx, idEmpleado) => {
  if (idEmpleado) return Number(idEmpleado);
  const admin = await tx.empleado.findFirst({ where: { rol: { in: ['Administrador', 'administrador'] } } });
  return admin?.idEmpleado ?? null;
};

// GET /api/transacciones/catalogos — todo lo necesario para el formulario
export const obtenerCatalogos = async (req, res) => {
  try {
    const [clientes, proveedores, animales, inventario, corrales, tiposAnimal] = await Promise.all([
      prisma.cliente.findMany({ orderBy: { nomCliente: 'asc' } }),
      prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } }),
      prisma.animal.findMany({
        where: { estado: 'Vivo' },
        select: { idAnimal: true, areteBandera: true, nombre: true, genero: true, idCorral: true,
          raza: { select: { nombre: true } }, tipoAnimal: { select: { nombre: true } } },
        orderBy: { areteBandera: 'asc' },
      }),
      prisma.inventario.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
      prisma.corral.findMany({ include: { _count: { select: { animales: { where: { estado: { not: 'Muerto' } } } } } } }),
      prisma.tipoAnimal.findMany({ where: { activo: true }, include: { razas: { where: { activo: true } } } }),
    ]);
    res.json({ clientes, proveedores, animales, inventario, corrales, tiposAnimal });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener catálogos', details: error.message });
  }
};

// GET /api/transacciones?tipo=&estado=&desde=&hasta=&q=
export const obtenerTransacciones = async (req, res) => {
  try {
    const { tipo, estado, desde, hasta, q } = req.query;
    const transacciones = await prisma.transaccion.findMany({
      where: {
        ...(tipo ? { tipo } : {}),
        ...(estado ? { estado } : {}),
        ...(desde || hasta ? { fecha: { ...(desde ? { gte: isoADate(desde) } : {}), ...(hasta ? { lte: isoADate(hasta) } : {}) } } : {}),
        ...(q ? { OR: [
          { folio: { contains: q, mode: 'insensitive' } },
          { cliente: { nomCliente: { contains: q, mode: 'insensitive' } } },
          { proveedor: { nombre: { contains: q, mode: 'insensitive' } } },
          { detalles: { some: { descripcion: { contains: q, mode: 'insensitive' } } } },
        ] } : {}),
      },
      include: incluirCompleto,
      orderBy: [{ fecha: 'desc' }, { idTransaccion: 'desc' }],
    });
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener transacciones', details: error.message });
  }
};

// GET /api/transacciones/resumen?desde=&hasta= — ingresos, egresos y serie mensual
export const obtenerResumen = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const lista = await prisma.transaccion.findMany({
      where: {
        estado: { not: 'Cancelado' },
        ...(desde || hasta ? { fecha: { ...(desde ? { gte: isoADate(desde) } : {}), ...(hasta ? { lte: isoADate(hasta) } : {}) } } : {}),
      },
      include: { detalles: { select: { concepto: true, cantidad: true } } },
    });

    const resumen = { ingresos: 0, egresos: 0, porCobrar: 0, porPagar: 0, cabezasVendidas: 0, cabezasCompradas: 0, operaciones: lista.length };
    const porMes = {};
    for (const t of lista) {
      const total = Number(t.total);
      const mes = t.fecha.toISOString().slice(0, 7);
      porMes[mes] ??= { mes, ingresos: 0, egresos: 0 };
      const cabezas = t.detalles.filter(d => d.concepto === 'Animal').reduce((s, d) => s + d.cantidad, 0);
      if (t.tipo === 'Venta') {
        resumen.ingresos += total; porMes[mes].ingresos += total; resumen.cabezasVendidas += cabezas;
        if (t.estado === 'Pendiente') resumen.porCobrar += total;
      } else {
        resumen.egresos += total; porMes[mes].egresos += total; resumen.cabezasCompradas += cabezas;
        if (t.estado === 'Pendiente') resumen.porPagar += total;
      }
    }
    resumen.balance = resumen.ingresos - resumen.egresos;
    resumen.porMes = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes));
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el resumen', details: error.message });
  }
};

// GET /api/transacciones/:id — para el comprobante
export const obtenerTransaccion = async (req, res) => {
  try {
    const t = await prisma.transaccion.findUnique({ where: { idTransaccion: Number(req.params.id) }, include: incluirCompleto });
    if (!t) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json(t);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la transacción', details: error.message });
  }
};

/**
 * POST /api/transacciones
 * {
 *   tipo: 'Venta' | 'Compra', fecha, estado, metodoPago, notas, idEmpleado,
 *   idCliente | nuevoCliente: { nomCliente, telefono, correo },        (ventas)
 *   idProveedor | nuevoProveedor: { nombre, telefono, correo },        (compras)
 *   detalles: [
 *     { concepto: 'Animal', idAnimal, precioUnitario },                (venta: el animal pasa a "Vendido")
 *     { concepto: 'Animal', nuevoAnimal: { areteBandera, idCorral, idTipoAnimal, idRaza, genero, ... }, precioUnitario }  (compra)
 *     { concepto: 'Insumo' | 'Herramienta', idInventario, cantidad, precioUnitario },   (mueve el stock)
 *     { concepto: 'Otro', descripcion, cantidad, precioUnitario }
 *   ]
 * }
 */
export const registrarTransaccion = async (req, res) => {
  try {
    const { tipo, fecha, estado = 'Pagado', metodoPago, notas, detalles = [] } = req.body;
    if (!TIPOS.includes(tipo)) return res.status(400).json({ error: 'Tipo inválido (Compra o Venta)' });
    if (!ESTADOS.includes(estado) || estado === 'Cancelado') return res.status(400).json({ error: 'Estado inválido' });
    if (!detalles.length) return res.status(400).json({ error: 'Agrega al menos un concepto a la transacción' });

    const fechaDate = isoADate(fecha || hoyISO());

    const creada = await prisma.$transaction(async (tx) => {
      const idEmpleado = await empleadoORespaldo(tx, req.body.idEmpleado);

      // ── Contraparte ──
      let idCliente = null, idProveedor = null;
      if (tipo === 'Venta') {
        if (req.body.nuevoCliente?.nomCliente) {
          const c = await tx.cliente.create({ data: {
            nomCliente: req.body.nuevoCliente.nomCliente, telefono: req.body.nuevoCliente.telefono || null,
            correo: req.body.nuevoCliente.correo || null } });
          idCliente = c.idClient;
        } else if (req.body.idCliente) {
          idCliente = Number(req.body.idCliente);
        } else throw new ErrorNegocio('Selecciona o registra un cliente');
      } else {
        if (req.body.nuevoProveedor?.nombre) {
          const p = await tx.proveedor.create({ data: {
            nombre: req.body.nuevoProveedor.nombre, telefono: req.body.nuevoProveedor.telefono || null,
            correo: req.body.nuevoProveedor.correo || null } });
          idProveedor = p.idProveedor;
        } else if (req.body.idProveedor) {
          idProveedor = Number(req.body.idProveedor);
        } else throw new ErrorNegocio('Selecciona o registra un proveedor');
      }

      // ── Detalles con reglas de negocio ──
      const lineas = [];
      const animalesVistos = new Set();
      for (const d of detalles) {
        if (!CONCEPTOS.includes(d.concepto)) throw new ErrorNegocio(`Concepto inválido: ${d.concepto}`);
        const precioUnitario = Number(d.precioUnitario);
        if (!(precioUnitario >= 0)) throw new ErrorNegocio('Todos los conceptos necesitan un precio válido');

        if (d.concepto === 'Animal' && tipo === 'Venta') {
          const animal = await tx.animal.findUnique({ where: { idAnimal: Number(d.idAnimal) } });
          if (!animal) throw new ErrorNegocio('Animal no encontrado');
          if (animal.estado !== 'Vivo') throw new ErrorNegocio(`El animal ${animal.areteBandera} no está disponible (estado: ${animal.estado})`);
          if (animalesVistos.has(animal.idAnimal)) throw new ErrorNegocio(`El animal ${animal.areteBandera} está repetido`);
          animalesVistos.add(animal.idAnimal);
          await tx.animal.update({ where: { idAnimal: animal.idAnimal }, data: { estado: 'Vendido' } });
          lineas.push({ concepto: 'Animal', idAnimal: animal.idAnimal, cantidad: 1, precioUnitario,
            descripcion: `${animal.areteBandera}${animal.nombre ? ` — ${animal.nombre}` : ''}` });

        } else if (d.concepto === 'Animal' && tipo === 'Compra') {
          const n = d.nuevoAnimal || {};
          if (!n.areteBandera || !n.idCorral || !n.idTipoAnimal || !n.idRaza || !n.genero) {
            throw new ErrorNegocio('Para comprar un ejemplar indica arete, corral, tipo, raza y género');
          }
          const corral = await tx.corral.findUnique({ where: { idCorral: Number(n.idCorral) } });
          if (!corral) throw new ErrorNegocio('El corral seleccionado no existe');
          const ocupados = await tx.animal.count({ where: { idCorral: corral.idCorral, estado: { not: 'Muerto' } } });
          if (ocupados >= corral.capacidadMaxima) throw new ErrorNegocio(`El corral "${corral.nombre}" está lleno (${corral.capacidadMaxima} máx.)`);

          const animal = await tx.animal.create({ data: {
            idCorral: corral.idCorral, idTipoAnimal: Number(n.idTipoAnimal), idRaza: Number(n.idRaza),
            areteBandera: n.areteBandera, areteBoton: n.areteBoton || null, nombre: n.nombre || null,
            genero: n.genero, origen: 'Compra', estado: 'Vivo', fechaIngreso: fechaDate,
            fechaNacimiento: n.fechaNacimiento ? isoADate(n.fechaNacimiento) : null,
          } });
          lineas.push({ concepto: 'Animal', idAnimal: animal.idAnimal, cantidad: 1, precioUnitario,
            descripcion: `${animal.areteBandera}${animal.nombre ? ` — ${animal.nombre}` : ''} (compra)` });

        } else if (d.concepto === 'Insumo' || d.concepto === 'Herramienta') {
          const cantidad = Number(d.cantidad);
          if (!Number.isInteger(cantidad) || cantidad <= 0) throw new ErrorNegocio('La cantidad debe ser un entero mayor a 0');
          const item = await tx.inventario.findUnique({ where: { idInventario: Number(d.idInventario) } });
          if (!item || !item.activo) throw new ErrorNegocio('Artículo de inventario no encontrado');
          if (tipo === 'Venta' && cantidad > item.cantidadActual) {
            throw new ErrorNegocio(`Stock insuficiente de ${item.nombre}: hay ${item.cantidadActual} ${item.unidad}`);
          }
          await tx.inventario.update({ where: { idInventario: item.idInventario },
            data: { cantidadActual: { increment: tipo === 'Compra' ? cantidad : -cantidad } } });
          if (idEmpleado) {
            await tx.movimientoInventario.create({ data: {
              idInventario: item.idInventario, idEmpleado, cantidad, fecha: fechaDate,
              tipoMovimiento: tipo === 'Compra' ? 'Entrada' : 'Salida',
              motivo: `${tipo} (transacción comercial)` } });
          }
          lineas.push({ concepto: d.concepto, idInventario: item.idInventario, cantidad, precioUnitario,
            descripcion: `${item.nombre} (${cantidad} ${item.unidad})` });

        } else {
          const cantidad = Math.max(1, Number(d.cantidad) || 1);
          if (!d.descripcion?.trim()) throw new ErrorNegocio('Describe el concepto "Otro"');
          lineas.push({ concepto: 'Otro', cantidad, precioUnitario, descripcion: d.descripcion.trim() });
        }
      }

      const total = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);
      const folio = await generarFolio(tx, tipo, fechaDate);

      return tx.transaccion.create({
        data: {
          folio, tipo, idCliente, idProveedor, idEmpleado, fecha: fechaDate, total, estado,
          metodoPago: metodoPago || null, notas: notas || null,
          detalles: { create: lineas.map(l => ({ ...l, subtotal: l.cantidad * l.precioUnitario })) },
        },
        include: incluirCompleto,
      });
    });

    res.status(201).json({ message: `${tipo} ${creada.folio} registrada`, transaccion: creada });
  } catch (error) {
    if (error instanceof ErrorNegocio) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Error al registrar la transacción', details: error.message });
  }
};

// PATCH /api/transacciones/:id/estado { estado } — al cancelar se revierten animales y stock
export const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
    const id = Number(req.params.id);

    const resultado = await prisma.$transaction(async (tx) => {
      const t = await tx.transaccion.findUnique({ where: { idTransaccion: id }, include: { detalles: true } });
      if (!t) throw new ErrorNegocio('Transacción no encontrada');
      if (t.estado === 'Cancelado') throw new ErrorNegocio('La transacción ya está cancelada');

      if (estado === 'Cancelado') {
        const idEmpleado = await empleadoORespaldo(tx, req.body.idEmpleado || t.idEmpleado);
        for (const d of t.detalles) {
          if (d.concepto === 'Animal' && d.idAnimal && t.tipo === 'Venta') {
            await tx.animal.update({ where: { idAnimal: d.idAnimal }, data: { estado: 'Vivo' } });
          }
          if (d.idInventario) {
            const item = await tx.inventario.findUnique({ where: { idInventario: d.idInventario } });
            const delta = t.tipo === 'Venta' ? d.cantidad : -d.cantidad;
            if (item && item.cantidadActual + delta < 0) {
              throw new ErrorNegocio(`No se puede revertir la compra de ${item.nombre}: ya no hay stock suficiente`);
            }
            await tx.inventario.update({ where: { idInventario: d.idInventario }, data: { cantidadActual: { increment: delta } } });
            if (idEmpleado) {
              await tx.movimientoInventario.create({ data: {
                idInventario: d.idInventario, idEmpleado, cantidad: d.cantidad, fecha: isoADate(hoyISO()),
                tipoMovimiento: delta > 0 ? 'Entrada' : 'Salida', motivo: `Cancelación ${t.folio}` } });
            }
          }
        }
      }
      return tx.transaccion.update({ where: { idTransaccion: id }, data: { estado }, include: incluirCompleto });
    });

    const nota = estado === 'Cancelado' && resultado.tipo === 'Compra' && resultado.detalles.some(d => d.concepto === 'Animal')
      ? ' Los animales comprados siguen registrados en el hato; edítalos o elimínalos desde Ganado si es necesario.'
      : '';
    res.json({ message: `Transacción ${resultado.folio} marcada como ${estado}.${nota}`, transaccion: resultado });
  } catch (error) {
    if (error instanceof ErrorNegocio) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Error al cambiar el estado', details: error.message });
  }
};
