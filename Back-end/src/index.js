import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import animalRoutes from './routes/animalRoutes.js';
import configRoutes from './routes/configRoutes.js'; // <-- 1. Importar las rutas de configuración
import historicoRoutes from './routes/historicoRoutes.js';
import saludRoutes from './routes/saludRoutes.js';

dotenv.config();

const app = express();
// CORS: si CORS_ORIGIN está definido (ej. la URL del front en Render) solo se permiten esos dominios
const origenesPermitidos = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : null;
app.use(cors(origenesPermitidos ? { origin: origenesPermitidos } : {}));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Rutas de la API
app.use('/api/empleados', authRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/configuracion', configRoutes); 
app.use('/api/historicos', historicoRoutes);
app.use('/api/salud', saludRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Rancho Puerta Pesada operando al 100% 🚀' });
});

// Health check usado por Render para saber si el servicio está vivo
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});