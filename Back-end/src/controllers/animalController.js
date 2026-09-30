import prisma from '../config/db.js';

// Obtener todos los animales con sus relaciones (Corral y Tipo de Animal)
export const obtenerAnimales = async (req, res) => {
  try {
    const animales = await prisma.animal.findMany({
      include: {
        corral: true,
        tipoAnimal: true
      },
      orderBy: { idAnimal: 'desc' }
    });
    res.json(animales);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el ganado', details: error.message });
  }
};

// Registrar un nuevo animal
export const registrarAnimal = async (req, res) => {
  try {
    const { 
      idCorral, 
      idTipoAnimal, 
      areteBandera, 
      areteBoton, 
      nombre, 
      genero, 
      raza, 
      origen, 
      fechaNacimiento, 
      fechaIngreso, 
      estado 
    } = req.body;

    const nuevoAnimal = await prisma.animal.create({
      data: {
        idCorral: Number(idCorral),
        idTipoAnimal: Number(idTipoAnimal),
        areteBandera,
        areteBoton: areteBoton || null,
        nombre: nombre || null,
        genero,
        raza,
        origen,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
        estado: estado || 'Vivo'
      },
      include: { corral: true, tipoAnimal: true }
    });

    res.status(201).json({ message: 'Animal registrado con éxito', animal: nuevoAnimal });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el animal', details: error.message });
  }
};

// Actualizar animal
export const actualizarAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      idCorral, 
      idTipoAnimal, 
      areteBandera, 
      areteBoton, 
      nombre, 
      genero, 
      raza, 
      origen, 
      fechaNacimiento, 
      fechaIngreso, 
      estado 
    } = req.body;

    const animalActualizado = await prisma.animal.update({
      where: { idAnimal: Number(id) },
      data: {
        idCorral: Number(idCorral),
        idTipoAnimal: Number(idTipoAnimal),
        areteBandera,
        areteBoton: areteBoton || null,
        nombre: nombre || null,
        genero,
        raza,
        origen,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : undefined,
        estado
      },
      include: { corral: true, tipoAnimal: true }
    });

    res.json({ message: 'Animal actualizado con éxito', animal: animalActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el animal', details: error.message });
  }
};

// Eliminar animal
export const eliminarAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.animal.delete({
      where: { idAnimal: Number(id) }
    });
    res.json({ message: 'Animal eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el animal', details: error.message });
  }
};

// Auxiliares para poblar los selectores en el Frontend (Corrales y Tipos)
export const obtenerCatalogosAnimales = async (req, res) => {
  try {
    const corrales = await prisma.corral.findMany();
    const tiposAnimal = await prisma.tipoAnimal.findMany();
    res.json({ corrales, tiposAnimal });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener catálogos', details: error.message });
  }
};