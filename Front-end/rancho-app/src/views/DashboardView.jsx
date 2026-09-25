// DashboardView.jsx — Tablero principal con métricas y actividad reciente

import { Beef, DollarSign, AlertTriangle, CalendarDays, ArrowRight } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { metricas, ventas, eventos, distribucionRaza } from '../data/mockData';

const MAX_RAZA = Math.max(...distribucionRaza.map(d => d.cantidad));

export default function DashboardView({ setActiveView }) {
  const ultimasVentas  = ventas.slice(0, 5);
  const proximosEvento = eventos.slice(0, 4);

  return (
    <div className="space-y-6">

      {/* ── Saludo ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">¡Bienvenido de vuelta! 👋</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Hoy es {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>

      {/* ── Tarjetas de métricas ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total de Animales"
          value={metricas.totalAnimales.toLocaleString()}
          subtitle={`${metricas.animalesActivos} activos, ${metricas.animalesEnfermos} enfermos`}
          icon={<Beef size={22} />}
          iconBg="bg-emerald-600"
          trend={5.2}
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${metricas.gananciaMes.toLocaleString('es-MX')}`}
          subtitle="vs. mes anterior"
          icon={<DollarSign size={22} />}
          iconBg="bg-blue-600"
          trend={43.9}
        />
        <StatCard
          title="Alertas de Inventario"
          value={metricas.alertasInventario}
          subtitle="Ítems con stock bajo"
          icon={<AlertTriangle size={22} />}
          iconBg="bg-amber-500"
          trend={-1}
          trendDown
        />
        <StatCard
          title="Próximos Eventos"
          value={metricas.proximosEventos}
          subtitle="En los próximos 15 días"
          icon={<CalendarDays size={22} />}
          iconBg="bg-violet-600"
        />
      </div>

      {/* ── Fila central ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Últimas ventas */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Últimas Transacciones</h3>
            <button
              onClick={() => setActiveView('ventas')}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Ver todas <ArrowRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Folio</th>
                  <th className="text-left px-5 py-3 font-medium">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Fecha</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                  <th className="text-center px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ultimasVentas.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{v.folio}</td>
                    <td className="px-5 py-3 text-slate-700 font-medium truncate max-w-[160px]">{v.cliente}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{v.fecha}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800">
                      ${v.total.toLocaleString('es-MX')}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge estado={v.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribución por raza */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Distribución por Raza</h3>
            <p className="text-xs text-slate-400 mt-0.5">Total: {metricas.totalAnimales} cabezas</p>
          </div>
          <div className="p-5 space-y-3">
            {distribucionRaza.map(({ raza, cantidad, color }) => (
              <div key={raza}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{raza}</span>
                  <span className="text-slate-500">{cantidad}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${(cantidad / MAX_RAZA) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Próximos eventos ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Próximos Eventos</h3>
          <button
            onClick={() => setActiveView('calendario')}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Ver calendario <ArrowRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {proximosEvento.map(ev => (
            <div key={ev.id} className="px-5 py-4">
              <Badge estado={ev.tipo} className="mb-2" />
              <p className="text-sm font-semibold text-slate-800 leading-snug mt-1">{ev.titulo}</p>
              <p className="text-xs text-slate-500 mt-1">📅 {ev.fecha} — {ev.hora}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">👤 {ev.responsable}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
