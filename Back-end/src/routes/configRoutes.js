import express from 'express';
import { 
  obtenerConfiguracion, 
  actualizarConfiguracion, 
  crearCorral, 
  actualizarCorral,
  eliminarCorral,
  crearTipoAnimal,
  actualizarTipoAnimal,
  eliminarTipoAnimal
} from '../controllers/configController.js';

const router = express.Router();

// Configuración general
router.get('/', obtenerConfiguracion);
router.put('/', actualizarConfiguracion);

// Corrales (CRUD completo)
router.post('/corrales', crearCorral);
router.put('/corrales/:id', actualizarCorral);
router.delete('/corrales/:id', eliminarCorral);

// Tipos de Animal (CRUD completo)
router.post('/tipos-animal', crearTipoAnimal);
router.put('/tipos-animal/:id', actualizarTipoAnimal);
router.delete('/tipos-animal/:id', eliminarTipoAnimal);

export default router;