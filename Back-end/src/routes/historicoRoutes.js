// Back-end/src/routes/historicoRoutes.js — Rutas completas para historiales de peso
import express from 'express';
import { 
  obtenerHistoricosPorAnimal, 
  registrarHistoricoIndividual, 
  registrarPesajeMasivo,
  actualizarHistorico,
  eliminarHistorico
} from '../controllers/historicoController.js';

const router = express.Router();

// Ruta de pesaje masivo por lote (debe ir antes de las rutas con :id para evitar conflictos)
router.post('/pesaje-masivo', registrarPesajeMasivo);

// Rutas asociadas a un animal en específico
router.get('/animal/:id', obtenerHistoricosPorAnimal);
router.post('/animal/:id', registrarHistoricoIndividual);

// Rutas directas para modificar o eliminar un registro histórico puntual por su idHistorico
router.put('/:idHistorico', actualizarHistorico);
router.delete('/:idHistorico', eliminarHistorico);

export default router;