import express from 'express';
import { 
  obtenerAnimales, 
  registrarAnimal, 
  actualizarAnimal, 
  eliminarAnimal, 
  obtenerCatalogosAnimales 
} from '../controllers/animalController.js';

const router = express.Router();

router.get('/', obtenerAnimales);
router.get('/catalogos', obtenerCatalogosAnimales); // Para llenar corrales y tipos en el form
router.post('/registro', registrarAnimal);
router.put('/:id', actualizarAnimal);
router.delete('/:id', eliminarAnimal);

export default router;