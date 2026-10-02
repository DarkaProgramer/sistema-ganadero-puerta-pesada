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

// Registrar un nuevo animal con validación de capacidad máxima del corral
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

    const corralIdNum = Number(idCorral);

    // 1. Buscar el corral para verificar su capacidad máxima
    const corral = await prisma.corral.findUnique({
      where: { idCorral: corralIdNum }
    });

    if (!corral) {
      return res.status(404).json({ error: 'El corral seleccionado no existe.' });
    }

    // 2. Contar cuántos animales activos hay actualmente en el corral (excluyendo muertos/bajas)
    const animalesActualesEnCorral = await prisma.animal.count({
      where: { 
        idCorral: corralIdNum,
        estado: { not: 'Muerto' }
      }
    });

    // 3. Validar si se supera el límite permitido
    if (animalesActualesEnCorral >= corral.capacidadMaxima) {
      return res.status(400).json({ 
        error: `El corral "${corral.nombre}" ha alcanzado su límite de capacidad (${corral.capacidadMaxima} animales). No se pueden registrar más cabezas aquí.` 
      });
    }

    // 4. Asegurar que el origen cumpla con el VarChar(10) de la BD (ej. 'Nacimiento' o 'Compra')
    const origenCorto = origen?.toLowerCase().includes('compra') ? 'Compra' : 'Nacimiento';

    // 5. Registrar el animal si hay cupo disponible
    const nuevoAnimal = await prisma.animal.create({
      data: {
        idCorral: corralIdNum,
        idTipoAnimal: Number(idTipoAnimal),
        areteBandera,
        areteBoton: areteBoton || null,
        nombre: nombre || null,
        genero,
        raza,
        origen: origenCorto,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
        estado: estado || 'Vivo'
      },
      include: { corral: true, tipoAnimal: true }
    });

    res.status(201).json({ message: 'Animal registrado con éxito', animal: nuevoAnimal });
  } catch (error) {
    console.error('Error al registrar animal:', error);
    res.status(500).json({ error: 'Error al registrar el animal', details: error.message });
  }
};

// Actualizar animal (incluyendo validación si se cambia de corral)
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

    const corralIdNum = Number(idCorral);
    const animalIdNum = Number(id);

    const animalActual = await prisma.animal.findUnique({
      where: { idAnimal: animalIdNum }
    });

    if (!animalActual) {
      return res.status(404).json({ error: 'El animal no existe.' });
    }

    if (animalActual.idCorral !== corralIdNum) {
      const nuevoCorral = await prisma.corral.findUnique({
        where: { idCorral: corralIdNum }
      });

      if (!nuevoCorral) {
        return res.status(404).json({ error: 'El nuevo corral seleccionado no existe.' });
      }

      const animalesEnNuevoCorral = await prisma.animal.count({
        where: { 
          idCorral: corralIdNum,
          estado: { not: 'Muerto' }
        }
      });

      if (animalesEnNuevoCorral >= nuevoCorral.capacidadMaxima) {
        return res.status(400).json({ 
          error: `El corral destino "${nuevoCorral.nombre}" está lleno (${nuevoCorral.capacidadMaxima} máx.). No se puede reubicar al animal.` 
        });
      }
    }

    const origenCorto = origen?.toLowerCase().includes('compra') ? 'Compra' : 'Nacimiento';

    const animalActualizado = await prisma.animal.update({
      where: { idAnimal: animalIdNum },
      data: {
        idCorral: corralIdNum,
        idTipoAnimal: Number(idTipoAnimal),
        areteBandera,
        areteBoton: areteBoton || null,
        nombre: nombre || null,
        genero,
        raza,
        origen: origenCorto,
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