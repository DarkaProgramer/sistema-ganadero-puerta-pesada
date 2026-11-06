// notificacionesConfig.js — Íconos y colores por tipo de notificación (Tarjeta 6)
import { Dna, Package, CalendarDays, Siren, Sprout } from 'lucide-react';

export const ICONO_TIPO = {
  Endogamia: { icon: Dna, cls: 'bg-purple-50 text-purple-600' },
  Stock: { icon: Package, cls: 'bg-red-50 text-red-600' },
  Evento: { icon: CalendarDays, cls: 'bg-sky-50 text-sky-600' },
  Incidencia: { icon: Siren, cls: 'bg-orange-50 text-orange-600' },
  Etapa: { icon: Sprout, cls: 'bg-emerald-50 text-emerald-600' },
};
export const SEVERIDAD_DOT = { critico: 'bg-red-500', aviso: 'bg-amber-400', info: 'bg-sky-400' };
