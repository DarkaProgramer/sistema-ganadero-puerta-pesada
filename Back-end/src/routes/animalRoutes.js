import express from 'express';
import { 
  obtenerAnimales, 
  registrarAnimal, 
  actualizarAnimal, 
  eliminarAnimal, 
  obtenerCatalogosAnimales 
} from '../controllers/animalController.js';

const router = express.Router();

// Ruta para obtener todos los animales registrados
router.get('/', obtenerAnimales);

// Ruta para obtener los corrales y tipos de animal con sus respectivas razas precargadas
router.get('/catalogos', obtenerCatalogosAnimales);

// Ruta para registrar un nuevo animal (con validación de capacidad de corral)
router.post('/registro', registrarAnimal);

// Ruta para actualizar los datos de un animal existente
router.put('/:id', actualizarAnimal);

// Ruta para eliminar un animal del sistema
router.delete('/:id', eliminarAnimal);

export default router;