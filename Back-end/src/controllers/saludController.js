// saludController.js — Controlador de salud y control sanitario
import prisma from '../config/db.js';

// Obtener todos los registros de salud y control sanitario
export const obtenerControlesSanitarios = async (req, res) => {
  try {
    const controles = await prisma.controlSanitario.findMany({
      include: {
        corral: true,
        empleado: { select: { idEmpleado: true, nombreCompleto: true } },
        tratamientos: {
          include: {
            animal: { select: { idAnimal: true, areteBandera: true, nombre: true } }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
    res.json(controles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los controles sanitarios', details: error.message });
  }
};

// Registrar control sanitario masivo por lote o individual guardando todos los campos
export const registrarControlSanitarioLote = async (req, res) => {
  try {
    const { 
      idCorral, 
      idAnimalIndividual,
      tipo,                 // 'Vacunación', 'Desparasitación', etc.
      fecha, 
      producto, 
      dosis,                // Nuevo campo de dosis
      responsable,          // idEmpleado principal
      ayudantes,            // Personal de apoyo
      observacionesGeneral, // Nota general de la campaña
      tratamientos          // Array: [{ idAnimal, aplicado: true/false, observaciones: '...' }]
    } = req.body;

    const corralIdNum = idCorral ? Number(idCorral) : null;
    const empleadoIdNum = Number(responsable);

    // 1. Crear el registro principal del control sanitario con sus campos específicos
    const nuevoControl = await prisma.controlSanitario.create({
      data: {
        idCorral: corralIdNum,
        tipo: tipo || 'Vacunación',
        fecha: fecha ? new Date(fecha) : new Date(),
        producto: producto.trim(),
        dosis: dosis ? dosis.trim() : null,
        responsable: empleadoIdNum,
        ayudantes: ayudantes ? ayudantes.trim() : null,
        observaciones: observacionesGeneral ? observacionesGeneral.trim() : null,
        estado: 'Aplicado'
      }
    });

    // 2. Registrar los tratamientos asociados (por lote o caso individual)
    let tratamientosAProcesar = [];

    if (tratamientos && Array.isArray(tratamientos) && tratamientos.length > 0) {
      tratamientosAProcesar = tratamientos.map(t => ({
        idControl: nuevoControl.idControl,
        idAnimal: Number(t.idAnimal),
        estado: t.aplicado ? 'Aplicado' : 'Omitido',
        fechaAplicacion: fecha ? new Date(fecha) : new Date(),
        observaciones: t.observaciones ? t.observaciones.trim() : null // Observación individual por animal
      }));
    } else if (idAnimalIndividual) {
      tratamientosAProcesar = [{
        idControl: nuevoControl.idControl,
        idAnimal: Number(idAnimalIndividual),
        estado: 'Aplicado',
        fechaAplicacion: fecha ? new Date(fecha) : new Date(),
        observaciones: observacionesGeneral ? observacionesGeneral.trim() : null
      }];
    }

    if (tratamientosAProcesar.length > 0) {
      await prisma.tratamientoAnimal.createMany({
        data: tratamientosAProcesar
      });
    }

    res.status(201).json({ 
      message: 'Campaña sanitaria registrada con éxito', 
      idControl: nuevoControl.idControl 
    });
  } catch (error) {
    console.error('Error al registrar salud:', error);
    res.status(500).json({ error: 'Error al registrar la campaña sanitaria', details: error.message });
  }
};

// Actualizar un control sanitario
export const actualizarControlSanitario = async (req, res) => {
  try {
    const { id } = req.params;
    const { producto, dosis, fecha, observaciones, ayudantes, responsable } = req.body;

    const controlActualizado = await prisma.controlSanitario.update({
      where: { idControl: Number(id) },
      data: {
        producto: producto?.trim(),
        dosis: dosis?.trim(),
        fecha: fecha ? new Date(fecha) : undefined,
        observaciones: observaciones?.trim(),
        ayudantes: ayudantes?.trim(),
        responsable: responsable ? Number(responsable) : undefined
      }
    });

    res.json({ message: 'Registro sanitario actualizado correctamente', control: controlActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el control sanitario', details: error.message });
  }
};

// Eliminar un control sanitario
export const eliminarControlSanitario = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.controlSanitario.delete({
      where: { idControl: Number(id) }
    });
    res.json({ message: 'Control sanitario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el control sanitario', details: error.message });
  }
};