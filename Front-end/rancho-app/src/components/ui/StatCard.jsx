// StatCard.jsx — Tarjeta de métrica reutilizable para el Dashboard

import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * @param {string}  title      - Etiqueta de la métrica
 * @param {string}  value      - Valor principal a mostrar
 * @param {string}  subtitle   - Texto secundario / descripción
 * @param {node}    icon       - Icono de Lucide React
 * @param {string}  iconBg     - Clase Tailwind para el fondo del ícono (ej: "bg-emerald-500")
 * @param {number}  trend      - Porcentaje de cambio (positivo=bueno, negativo=malo) — opcional
 * @param {boolean} trendDown  - Si true, un trend negativo es bueno (ej: enfermos)
 */
export default function StatCard({ title, value, subtitle, icon, iconBg = 'bg-emerald-500', trend, trendDown = false }) {
  const isPositive = trend >= 0;
  const isBeneficial = trendDown ? !isPositive : isPositive;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      {/* Ícono */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center text-white`}>
        {icon}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>

      {/* Tendencia */}
      {trend !== undefined && (
        <div className={`flex-shrink-0 flex items-center gap-0.5 text-xs font-semibold ${isBeneficial ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
}
