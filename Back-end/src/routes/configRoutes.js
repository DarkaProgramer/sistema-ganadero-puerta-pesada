// configRoutes.js — Rutas para la configuración general y catálogos de corrales y tipos de animal

import express from 'express';
import { 
  obtenerConfiguracion, 
  actualizarConfiguracion, 
  obtenerCorrales,
  crearCorral, 
  actualizarCorral,
  eliminarCorral,
  obtenerTiposAnimal,
  crearTipoAnimal,
  actualizarTipoAnimal,
  eliminarTipoAnimal
} from '../controllers/configController.js';

const router = express.Router();

// ==================== CONFIGURACIÓN GENERAL ====================
router.get('/', obtenerConfiguracion);
router.put('/', actualizarConfiguracion);

// ==================== CORRALES ====================
router.get('/corrales', obtenerCorrales);
router.post('/corrales', crearCorral);
router.put('/corrales/:id', actualizarCorral);
router.delete('/corrales/:id', eliminarCorral);

// ==================== TIPOS DE ANIMAL ====================
router.get('/tipos-animal', obtenerTiposAnimal);
router.post('/tipos-animal', crearTipoAnimal);
router.put('/tipos-animal/:id', actualizarTipoAnimal);
router.delete('/tipos-animal/:id', eliminarTipoAnimal);

export default router;