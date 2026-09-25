// Sidebar.jsx — Menú lateral retráctil

import {
  LayoutDashboard, Beef, TrendingUp, Syringe,
  Package, Users, CalendarDays, ChevronLeft,
  ChevronRight, Settings, LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Inicio',       icon: LayoutDashboard },
  { id: 'ganado',      label: 'Ganado',        icon: Beef            },
  { id: 'ventas',      label: 'Ventas',        icon: TrendingUp      },
  { id: 'vacunacion',  label: 'Vacunación',    icon: Syringe         },
  { id: 'inventario',  label: 'Inventario',    icon: Package         },
  { id: 'clientes',    label: 'Clientes',      icon: Users           },
  { id: 'calendario',  label: 'Calendario',    icon: CalendarDays    },
];

export default function Sidebar({ activeView, setActiveView, collapsed, setCollapsed, onLogout }) {
  return (
    <aside
      className={`
        flex-shrink-0 flex flex-col bg-slate-900 text-white
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[70px]' : 'w-[240px]'}
        min-h-screen relative
      `}
    >
      {/* ── Logo ──────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700/60 ${collapsed ? 'justify-center' : ''}`}>
        {/* Ícono del rancho */}
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm select-none">
          PP
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-white text-sm leading-tight">Puerta Pesada</p>
            <p className="text-xs text-slate-400 leading-tight">Gestión Ganadera</p>
          </div>
        )}
      </div>

      {/* ── Botón colapsar ───────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-slate-700 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-md transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* ── Navegación principal ─────────────────────────── */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {!collapsed && (
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Módulos
          </p>
        )}
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return (
              <li key={id}>
                <button
                  onClick={() => setActiveView(id)}
                  title={collapsed ? label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150 group
                    ${isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {/* ── Separador ───────────────────────────────────── */}
        <div className="my-4 mx-4 border-t border-slate-700/60" />

        {!collapsed && (
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Sistema
          </p>
        )}
        <ul className="space-y-0.5 px-2">
          <li>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Configuración' : undefined}
            >
              <Settings size={18} className="flex-shrink-0" />
              {!collapsed && <span>Configuración</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* ── Footer / Cerrar sesión ───────────────────────── */}
      <div className={`border-t border-slate-700/60 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={onLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
