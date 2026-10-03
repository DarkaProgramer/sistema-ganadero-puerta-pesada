import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import animalRoutes from './routes/animalRoutes.js';
import configRoutes from './routes/configRoutes.js'; // <-- 1. Importar las rutas de configuración
import historicoRoutes from './routes/historicoRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Rutas de la API
app.use('/api/empleados', authRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/configuracion', configRoutes); 
app.use('/api/historicos', historicoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Rancho Puerta Pesada operando al 100% 🚀' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});