// Badge.jsx — Etiqueta de estado reutilizable

const configs = {
  // Estados de animales
  activo:        { label: 'Activo',         classes: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  vendido:       { label: 'Vendido',        classes: 'bg-slate-100 text-slate-600 ring-slate-200'       },
  enfermo:       { label: 'Enfermo',        classes: 'bg-red-100 text-red-700 ring-red-200'             },
  // Estados de inventario
  disponible:    { label: 'Disponible',     classes: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  en_reparacion: { label: 'En reparación',  classes: 'bg-amber-100 text-amber-700 ring-amber-200'       },
  stock_bajo:    { label: 'Stock bajo',     classes: 'bg-red-100 text-red-700 ring-red-200'             },
  // Estados de pago / ventas
  pagado:        { label: 'Pagado',         classes: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  pendiente:     { label: 'Pendiente',      classes: 'bg-red-100 text-red-700 ring-red-200'             },
  parcial:       { label: 'Parcial',        classes: 'bg-amber-100 text-amber-700 ring-amber-200'       },
  // Métodos de pago
  contado:       { label: 'Contado',        classes: 'bg-blue-100 text-blue-700 ring-blue-200'          },
  transferencia: { label: 'Transferencia',  classes: 'bg-indigo-100 text-indigo-700 ring-indigo-200'    },
  crédito:       { label: 'Crédito',        classes: 'bg-purple-100 text-purple-700 ring-purple-200'    },
  parcialidades: { label: 'Parcialidades',  classes: 'bg-amber-100 text-amber-700 ring-amber-200'       },
  // Tipos de evento
  vacunacion:    { label: 'Vacunación',     classes: 'bg-teal-100 text-teal-700 ring-teal-200'          },
  mantenimiento: { label: 'Mantenimiento',  classes: 'bg-orange-100 text-orange-700 ring-orange-200'    },
  venta:         { label: 'Venta',          classes: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  veterinaria:   { label: 'Veterinaria',    classes: 'bg-rose-100 text-rose-700 ring-rose-200'          },
  inventario:    { label: 'Inventario',     classes: 'bg-sky-100 text-sky-700 ring-sky-200'             },
  cobro:         { label: 'Cobro',          classes: 'bg-violet-100 text-violet-700 ring-violet-200'    },
  // Clientes
  alerta:        { label: 'Alerta',         classes: 'bg-red-100 text-red-700 ring-red-200'             },
};

export default function Badge({ estado, className = '' }) {
  const cfg = configs[estado] ?? { label: estado, classes: 'bg-slate-100 text-slate-600 ring-slate-200' };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.classes} ${className}`}
    >
      {cfg.label}
    </span>
  );
}
