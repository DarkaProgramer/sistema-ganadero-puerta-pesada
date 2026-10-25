// saludRoutes.js — Rutas para el control sanitario y de salud animal
import { Router } from 'express';
import { 
  obtenerControlesSanitarios, 
  registrarControlSanitarioLote, 
  actualizarControlSanitario,
  eliminarControlSanitario 
} from '../controllers/saludController.js';

const router = Router();

// Obtener todos los registros de salud
router.get('/', obtenerControlesSanitarios);

// Registrar una campaña sanitaria masiva por lote o individual
router.post('/', registrarControlSanitarioLote);

// Actualizar un registro sanitario
router.put('/:id', actualizarControlSanitario);

// Eliminar un control sanitario
router.delete('/:id', eliminarControlSanitario);

export default router;