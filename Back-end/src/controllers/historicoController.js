// Back-end/src/controllers/historicoController.js — CRUD completo para Historiales de Peso
import prisma from '../config/db.js';

// 1. OBTENER: Todos los historicos de pesaje de un animal específico (para su ficha de detalle)
export const obtenerHistoricosPorAnimal = async (req, res) => {
  try {
    const { id } = req.params; // idAnimal
    const historicos = await prisma.historicoAnimal.findMany({
      where: { idAnimal: Number(id) },
      orderBy: { fecha: 'desc' }
    });
    res.json(historicos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de pesajes', details: error.message });
  }
};

// 2. CREAR: Registrar un pesaje individual
export const registrarHistoricoIndividual = async (req, res) => {
  try {
    const { id } = req.params; // idAnimal
    const { fecha, peso, etapa } = req.body;

    const nuevoHistorico = await prisma.historicoAnimal.create({
      data: {
        idAnimal: Number(id),
        fecha: fecha ? new Date(fecha) : new Date(),
        peso: Number(peso),
        etapa: etapa || 'Engorda'
      }
    });

    res.status(201).json({ message: 'Pesaje registrado con éxito', historico: nuevoHistorico });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el pesaje individual', details: error.message });
  }
};

// 3. CREAR (Masivo): Registrar pesaje por lote (para corrales completos)
export const registrarPesajeMasivo = async (req, res) => {
  try {
    const { fecha, etapa, registros } = req.body; 
    // registros espera un array como: [{ idAnimal: 1, peso: 450 }, { idAnimal: 2, peso: 420 }]

    if (!registros || registros.length === 0) {
      return res.status(400).json({ error: 'No hay registros de peso para guardar.' });
    }

    const fechaObj = fecha ? new Date(fecha) : new Date();

    const datosASubir = registros.map(item => ({
      idAnimal: Number(item.idAnimal),
      fecha: fechaObj,
      peso: Number(item.peso),
      etapa: etapa || 'Engorda'
    }));

    const resultado = await prisma.historicoAnimal.createMany({
      data: datosASubir,
      skipDuplicates: true
    });

    res.status(201).json({ 
      message: `Se registraron exitosamente ${resultado.count} pesajes.`,
      count: resultado.count 
    });

  } catch (error) {
    console.error('Error en pesaje masivo:', error);
    res.status(500).json({ error: 'Error al procesar el pesaje masivo', details: error.message });
  }
};

// 4. ACTUALIZAR: Modificar un registro de peso existente por su ID de histórico
export const actualizarHistorico = async (req, res) => {
  try {
    const { idHistorico } = req.params;
    const { fecha, peso, etapa } = req.body;

    const historicoActualizado = await prisma.historicoAnimal.update({
      where: { idHistorico: Number(idHistorico) },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        peso: peso ? Number(peso) : undefined,
        etapa
      }
    });

    res.json({ message: 'Registro de peso actualizado con éxito', historico: historicoActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el registro de peso', details: error.message });
  }
};

// 5. ELIMINAR: Borrar un registro de peso erróneo
export const eliminarHistorico = async (req, res) => {
  try {
    const { idHistorico } = req.params;

    await prisma.historicoAnimal.delete({
      where: { idHistorico: Number(idHistorico) }
    });

    res.json({ message: 'Registro de peso eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el registro de peso', details: error.message });
  }
};