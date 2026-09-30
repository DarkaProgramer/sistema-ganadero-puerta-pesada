import { Router } from 'express';
import { 
  registrarEmpleado, 
  obtenerEmpleados, 
  loginEmpleado, 
  eliminarEmpleado,
  actualizarEmpleado // <-- Asegúrate de importarla
} from '../controllers/authController.js';

const router = Router();

router.post('/registro', registrarEmpleado);
router.post('/login', loginEmpleado);
router.get('/', obtenerEmpleados);
router.delete('/:id', eliminarEmpleado);
router.put('/:id', actualizarEmpleado);
export default router;