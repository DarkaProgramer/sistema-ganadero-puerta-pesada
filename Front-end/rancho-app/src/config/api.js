// src/config/api.js — URL base del backend
// En local usa http://localhost:4000. En producción (Render) se define VITE_API_URL
// con la URL del servicio, ej: https://rancho-puerta-pesada-api.onrender.com
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
