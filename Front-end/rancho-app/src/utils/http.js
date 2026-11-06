// utils/http.js — Helper para llamar al API de los módulos nuevos
import { API_URL } from '../config/api';

/**
 * api('/api/inventario')                       → GET
 * api('/api/inventario', { method: 'POST', body: {...} })
 * Lanza un Error con el mensaje del backend cuando la respuesta no es 2xx.
 */
export async function api(ruta, { method = 'GET', body, query } = {}) {
  const qs = query
    ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
    : '';
  let res;
  try {
    res = await fetch(`${API_URL}${ruta}${qs}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté encendido.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export const esAdmin = (usuario) => ['administrador', 'admin'].includes(String(usuario?.rol || '').toLowerCase());

export const formatoMoneda = (valor, moneda = 'MXN') =>
  Number(valor || 0).toLocaleString('es-MX', { style: 'currency', currency: moneda, maximumFractionDigits: 2 });

// Las fechas @db.Date llegan como "YYYY-MM-DDT00:00:00.000Z": se muestran sin desfase de zona horaria
export const formatoFecha = (fecha, opciones = { day: '2-digit', month: 'short', year: 'numeric' }) => {
  if (!fecha) return '—';
  const iso = String(fecha);
  const d = iso.length <= 10 || iso.endsWith('T00:00:00.000Z')
    ? new Date(`${iso.slice(0, 10)}T12:00:00`)
    : new Date(iso);
  return d.toLocaleDateString('es-MX', opciones);
};

export const formatoFechaHora = (fecha) =>
  fecha ? new Date(fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Hace "hace 5 min", "hace 2 h", "hace 3 días"
export const tiempoRelativo = (fecha) => {
  const seg = Math.round((Date.now() - new Date(fecha)) / 1000);
  if (seg < 60) return 'justo ahora';
  if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;
  if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
  const dias = Math.floor(seg / 86400);
  return dias === 1 ? 'ayer' : `hace ${dias} días`;
};
