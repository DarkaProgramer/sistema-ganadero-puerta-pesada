import prisma from '../config/db.js';

// ==================== CONFIGURACIÓN GENERAL ====================

// Obtener la configuración del rancho (Si no existe, crea una por defecto)
export const obtenerConfiguracion = async (req, res) => {
  try {
    let config = await prisma.configuracionRancho.findFirst();
    if (!config) {
      config = await prisma.configuracionRancho.create({
        data: {
          nombreRancho: 'Rancho Puerta Pesada',
          logoUrl: '/logo-Rancho.png',
          moneda: 'MXN',
          unidadPeso: 'kg'
        }
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la configuración', details: error.message });
  }
};

// Actualizar la configuración del rancho
export const actualizarConfiguracion = async (req, res) => {
  try {
    const { nombreRancho, logoUrl, moneda, unidadPeso } = req.body;

    let config = await prisma.configuracionRancho.findFirst();

    if (!config) {
      config = await prisma.configuracionRancho.create({
        data: { nombreRancho, logoUrl, moneda, unidadPeso }
      });
    } else {
      config = await prisma.configuracionRancho.update({
        where: { idConfiguracion: config.idConfiguracion },
        data: { nombreRancho, logoUrl, moneda, unidadPeso }
      });
    }

    res.json({ message: 'Configuración actualizada con éxito', config });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la configuración', details: error.message });
  }
};


// ==================== CORRALES ====================

// Obtener lista de corrales
export const obtenerCorrales = async (req, res) => {
  try {
    const corrales = await prisma.corral.findMany();
    res.json(corrales);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los corrales', details: error.message });
  }
};

// Crear un corral
export const crearCorral = async (req, res) => {
  try {
    const { nombre, capacidadMaxima } = req.body;
    const nuevoCorral = await prisma.corral.create({
      data: { nombre, capacidadMaxima: Number(capacidadMaxima) }
    });
    res.status(201).json({ message: 'Corral creado con éxito', corral: nuevoCorral });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el corral', details: error.message });
  }
};

// Actualizar un corral
export const actualizarCorral = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, capacidadMaxima } = req.body;
    const corralActualizado = await prisma.corral.update({
      where: { idCorral: Number(id) },
      data: { nombre, capacidadMaxima: Number(capacidadMaxima) }
    });
    res.json({ message: 'Corral actualizado con éxito', corral: corralActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el corral', details: error.message });
  }
};

// Eliminar un corral
export const eliminarCorral = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.corral.delete({ where: { idCorral: Number(id) } });
    res.json({ message: 'Corral eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el corral', details: error.message });
  }
};


// ==================== TIPOS DE ANIMAL ====================

// Obtener lista de tipos de animal
export const obtenerTiposAnimal = async (req, res) => {
  try {
    const tipos = await prisma.tipoAnimal.findMany();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los tipos de animal', details: error.message });
  }
};

// Crear un tipo de animal
export const crearTipoAnimal = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nuevoTipo = await prisma.tipoAnimal.create({ data: { nombre, activo: true } });
    res.status(201).json({ message: 'Tipo de animal creado con éxito', tipoAnimal: nuevoTipo });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el tipo de animal', details: error.message });
  }
};

// Actualizar un tipo de animal (incluyendo su estado activo/inactivo)
export const actualizarTipoAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;
    const tipoActualizado = await prisma.tipoAnimal.update({
      where: { idTipoAnimal: Number(id) },
      data: { 
        ...(nombre !== undefined && { nombre }),
        ...(activo !== undefined && { activo })
      }
    });
    res.json({ message: 'Tipo actualizado con éxito', tipoAnimal: tipoActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el tipo de animal', details: error.message });
  }
};

// Eliminar un tipo de animal
export const eliminarTipoAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tipoAnimal.delete({ where: { idTipoAnimal: Number(id) } });
    res.json({ message: 'Tipo de animal eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el tipo de animal', details: error.message });
  }
};


// ==================== PUESTOS DE EMPLEADOS ====================

// Obtener todos los puestos
export const obtenerPuestosEmpleado = async (req, res) => {
  try {
    const puestos = await prisma.puestoEmpleado.findMany();
    res.json(puestos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los puestos de empleado', details: error.message });
  }
};

// Crear un nuevo puesto personalizado
export const crearPuestoEmpleado = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nuevoPuesto = await prisma.puestoEmpleado.create({ 
      data: { nombre, activo: true } 
    });
    res.status(201).json({ message: 'Puesto creado con éxito', puesto: nuevoPuesto });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el puesto', details: error.message });
  }
};

// Actualizar un puesto (nombre o estado activo/inactivo)
export const actualizarPuestoEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;
    const puestoActualizado = await prisma.puestoEmpleado.update({
      where: { idPuesto: Number(id) },
      data: { 
        ...(nombre !== undefined && { nombre }), 
        ...(activo !== undefined && { activo }) 
      }
    });
    res.json({ message: 'Puesto actualizado con éxito', puesto: puestoActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el puesto', details: error.message });
  }
};

// Eliminar un puesto
export const eliminarPuestoEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.puestoEmpleado.delete({ where: { idPuesto: Number(id) } });
    res.json({ message: 'Puesto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el puesto', details: error.message });
  }
};