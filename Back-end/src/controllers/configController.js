import prisma from '../config/db.js';

// Obtener la configuración del rancho (Si no existe, crea una por defecto)
export const obtenerConfiguracion = async (req, res) => {
  try {
    let config = await prisma.configuracionRancho.findFirst();
    if (!config) {
      config = await prisma.configuracionRancho.create({
        data: {
          nombreRancho: 'Rancho Puerta Pesada',
          logoUrl: '/assets/logo.png',
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

// Actualizar la configuración del rancho (Solo administradores)
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

export const eliminarCorral = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.corral.delete({ where: { idCorral: Number(id) } });
    res.json({ message: 'Corral eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el corral (puede que tenga animales asignados)', details: error.message });
  }
};


// ==================== TIPOS DE ANIMAL ====================

export const crearTipoAnimal = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nuevoTipo = await prisma.tipoAnimal.create({ data: { nombre } });
    res.status(201).json({ message: 'Tipo de animal creado con éxito', tipoAnimal: nuevoTipo });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el tipo de animal', details: error.message });
  }
};

export const actualizarTipoAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const tipoActualizado = await prisma.tipoAnimal.update({
      where: { idTipoAnimal: Number(id) },
      data: { nombre }
    });
    res.json({ message: 'Tipo actualizado con éxito', tipoAnimal: tipoActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el tipo de animal', details: error.message });
  }
};

export const eliminarTipoAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tipoAnimal.delete({ where: { idTipoAnimal: Number(id) } });
    res.json({ message: 'Tipo de animal eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el tipo (puede que esté en uso por algún animal)', details: error.message });
  }
};