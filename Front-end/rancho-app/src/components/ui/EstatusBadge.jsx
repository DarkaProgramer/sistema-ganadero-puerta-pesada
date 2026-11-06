// EstatusBadge.jsx — Etiqueta de estatus del empleado (Tarjeta 1)
import { ESTATUS } from '../../utils/estatusEmpleado';

export default function EstatusBadge({ estatus }) {
  const cfg = ESTATUS[estatus] || ESTATUS.Activo;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {estatus || 'Activo'}
    </span>
  );
}
