import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import animalRoutes from './routes/animalRoutes.js';
import configRoutes from './routes/configRoutes.js'; // <-- 1. Importar las rutas de configuración

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Rutas de la API
app.use('/api/empleados', authRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/configuracion', configRoutes); // <-- 2. Registrar el prefijo de configuración

app.get('/', (req, res) => {
  res.json({ message: 'API de Rancho Puerta Pesada operando al 100% 🚀' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});