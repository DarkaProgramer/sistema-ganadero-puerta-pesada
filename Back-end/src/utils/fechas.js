// utils/fechas.js — Helpers de fechas compartidos por los módulos nuevos

// Fecha local en formato YYYY-MM-DD (evita el desfase de toISOString con la zona horaria)
export const aISOFecha = (fecha) => {
  const d = new Date(fecha);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
};

// Las columnas @db.Date llegan como medianoche UTC: se leen en UTC para no perder un día
export const fechaDBaISO = (fecha) => (fecha ? new Date(fecha).toISOString().slice(0, 10) : null);

export const hoyISO = () => aISOFecha(new Date());

// Convierte 'YYYY-MM-DD' a Date en UTC (lo que espera una columna @db.Date)
export const isoADate = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T00:00:00.000Z`) : null);

export const sumarDiasISO = (iso, dias) => {
  const d = isoADate(iso);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

// Hora 'HH:MM' <-> columna @db.Time
export const horaADate = (hora) => (hora ? new Date(`1970-01-01T${hora.length === 5 ? `${hora}:00` : hora}.000Z`) : null);
export const dateAHora = (fecha) => (fecha ? new Date(fecha).toISOString().slice(11, 16) : null);

// Día de la semana (0 = domingo) de una fecha ISO
export const diaSemanaISO = (iso) => isoADate(iso).getUTCDay();

// Recorre cada fecha ISO entre desde y hasta (inclusive)
export function* rangoFechas(desdeISO, hastaISO) {
  let actual = desdeISO;
  while (actual <= hastaISO) {
    yield actual;
    actual = sumarDiasISO(actual, 1);
  }
}

// ¿Un evento (con o sin recurrencia) ocurre en la fecha ISO indicada?
export const eventoOcurreEn = (evento, iso) => {
  const inicio = fechaDBaISO(evento.fecha);
  const fin = fechaDBaISO(evento.fechaFin);
  if (iso < inicio) return false;
  if (fin && iso > fin) return false;

  switch (evento.recurrencia) {
    case 'Semanal': {
      const dias = (evento.diasSemana || String(diaSemanaISO(inicio)))
        .split(',').map(d => Number(d.trim())).filter(d => !Number.isNaN(d));
      return dias.includes(diaSemanaISO(iso));
    }
    case 'Mensual':
      return iso.slice(8, 10) === inicio.slice(8, 10);
    default:
      return iso === inicio;
  }
};
