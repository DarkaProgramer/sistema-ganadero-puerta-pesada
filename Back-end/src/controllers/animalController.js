// animalController.js — Controlador de ganado con historial médico incluido y responsable en tratamientos
import prisma from '../config/db.js';

const verificarEndogamia = async (idCorral, idPadre, idMadre, animalIdExcluir = null) => {
  if (!idCorral) return null;

  const animalesEnCorral = await prisma.animal.findMany({
    where: { 
      idCorral: Number(idCorral),
      estado: 'Vivo',
      ...(animalIdExcluir ? { idAnimal: { not: Number(animalIdExcluir) } } : {})
    },
    select: { idAnimal: true, areteBandera: true, nombre: true }
  });

  const idsEnCorral = animalesEnCorral.map(a => a.idAnimal);
  let advertencia = null;

  if (idPadre && idsEnCorral.includes(Number(idPadre))) {
    const padre = animalesEnCorral.find(a => a.idAnimal === Number(idPadre));
    advertencia = `⚠️ Advertencia de Endogamia: El padre (Arete: ${padre?.areteBandera || idPadre}) ya se encuentra habitando en este mismo corral.`;
  }

  if (idMadre && idsEnCorral.includes(Number(idMadre))) {
    const madre = animalesEnCorral.find(a => a.idAnimal === Number(idMadre));
    advertencia = `⚠️ Advertencia de Endogamia: La madre (Arete: ${madre?.areteBandera || idMadre}) ya se encuentra habitando en este mismo corral.`;
  }

  return advertencia;
};

// Obtener todos los animales con sus relaciones completas, incluyendo Historial Médico y el empleado responsable
export const obtenerAnimales = async (req, res) => {
  try {
    const animales = await prisma.animal.findMany({
      include: {
        corral: true,
        tipoAnimal: true,
        raza: true,
        padre: { select: { idAnimal: true, areteBandera: true, nombre: true } },
        madre: { select: { idAnimal: true, areteBandera: true, nombre: true } },
        tratamientos: {
          include: {
            controlSanitario: {
              include: {
                empleado: true // Incluye los datos del empleado responsable
              }
            }
          },
          orderBy: { fechaAplicacion: 'desc' }
        }
      },
      orderBy: { idAnimal: 'desc' }
    });
    res.json(animales);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el ganado', details: error.message });
  }
};

export const registrarAnimal = async (req, res) => {
  try {
    const { 
      idCorral, 
      idTipoAnimal, 
      idRaza,
      detalleMestizo,
      areteBandera, 
      areteBoton, 
      nombre, 
      genero, 
      origen, 
      fechaNacimiento, 
      fechaIngreso, 
      estado,
      idPadre,
      idMadre
    } = req.body;

    const corralIdNum = Number(idCorral);

    const corral = await prisma.corral.findUnique({
      where: { idCorral: corralIdNum }
    });

    if (!corral) {
      return res.status(404).json({ error: 'El corral seleccionado no existe.' });
    }

    const animalesActualesEnCorral = await prisma.animal.count({
      where: { 
        idCorral: corralIdNum,
        estado: { not: 'Muerto' }
      }
    });

    if (animalesActualesEnCorral >= corral.capacidadMaxima) {
      return res.status(400).json({ 
        error: `El corral "${corral.nombre}" ha alcanzado su límite de capacidad (${corral.capacidadMaxima} animales).` 
      });
    }

    const origenCorto = origen?.toLowerCase().includes('compra') ? 'Compra' : 'Nacimiento';
    const padreIdNum = (origenCorto === 'Nacimiento' && idPadre && idPadre !== '') ? Number(idPadre) : null;
    const madreIdNum = (origenCorto === 'Nacimiento' && idMadre && idMadre !== '') ? Number(idMadre) : null;

    const alertaEndogamia = await verificarEndogamia(corralIdNum, padreIdNum, madreIdNum);

    const nuevoAnimal = await prisma.animal.create({
      data: {
        idCorral: corralIdNum,
        idTipoAnimal: Number(idTipoAnimal),
        idRaza: Number(idRaza),
        detalleMestizo: detalleMestizo || null,
        areteBandera,
        areteBoton: areteBoton || null,
        nombre: nombre || null,
        genero,
        origen: origenCorto,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
        estado: estado || 'Vivo',
        idPadre: padreIdNum,
        idMadre: madreIdNum
      },
      include: { corral: true, tipoAnimal: true, raza: true, padre: true, madre: true }
    });

    res.status(201).json({ 
      message: 'Animal registrado con éxito', 
      animal: nuevoAnimal,
      warning: alertaEndogamia 
    });
  } catch (error) {
    console.error('Error detallado al registrar animal:', error);
    res.status(500).json({ error: 'Error al registrar el animal', details: error.message });
  }
};

export const actualizarAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      idCorral, 
      idTipoAnimal, 
      idRaza,
      detalleMestizo,
      areteBandera, 
      areteBoton, 
      nombre, 
      genero, 
      origen, 
      fechaNacimiento, 
      fechaIngreso, 
      estado,
      idPadre,
      idMadre
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
          error: `El corral destino "${nuevoCorral.nombre}" está lleno (${nuevoCorral.capacidadMaxima} máx.).` 
        });
      }
    }

    const origenCorto = origen?.toLowerCase().includes('compra') ? 'Compra' : 'Nacimiento';
    const padreIdNum = (origenCorto === 'Nacimiento' && idPadre && idPadre !== '') ? Number(idPadre) : null;
    const madreIdNum = (origenCorto === 'Nacimiento' && idMadre && idMadre !== '') ? Number(idMadre) : null;

    const alertaEndogamia = await verificarEndogamia(corralIdNum, padreIdNum, madreIdNum, animalIdNum);

    const animalActualizado = await prisma.animal.update({
      where: { idAnimal: animalIdNum },
      data: {
        idCorral: corralIdNum,
        idTipoAnimal: Number(idTipoAnimal),
        idRaza: Number(idRaza),
        detalleMestizo: detalleMestizo || null,
        areteBandera,
        areteBoton: areteBoton || null,
        nombre: nombre || null,
        genero,
        origen: origenCorto,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : undefined,
        estado,
        idPadre: padreIdNum,
        idMadre: madreIdNum
      },
      include: { corral: true, tipoAnimal: true, raza: true, padre: true, madre: true }
    });

    res.json({ 
      message: 'Animal actualizado con éxito', 
      animal: animalActualizado,
      warning: alertaEndogamia 
    });
  } catch (error) {
    console.error('Error detallado al actualizar animal:', error);
    res.status(500).json({ error: 'Error al actualizar el animal', details: error.message });
  }
};

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

export const obtenerCatalogosAnimales = async (req, res) => {
  try {
    const corrales = await prisma.corral.findMany();
    
    const tiposAnimal = await prisma.tipoAnimal.findMany({
      where: { activo: true },
      include: { 
        razas: {
          where: { activo: true }
        } 
      }
    });
    
    const animalesLista = await prisma.animal.findMany({
      where: { estado: 'Vivo' },
      select: { idAnimal: true, areteBandera: true, nombre: true, genero: true, idCorral: true },
      orderBy: { areteBandera: 'asc' }
    });

    res.json({ corrales, tiposAnimal, animalesLista });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener catálogos', details: error.message });
  }
};