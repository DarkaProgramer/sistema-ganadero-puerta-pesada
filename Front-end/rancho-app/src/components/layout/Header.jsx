// Header.jsx — Barra superior con título, notificaciones y usuario
import { Bell, Menu, ChevronDown } from 'lucide-react';
import { useRancho } from '../../context/RanchoContext'; // Ajusta la ruta según la ubicación exacta de tu Header

const VIEW_TITLES = {
  dashboard:     'Tablero Principal',
  ganado:        'Gestión de Ganado',
  ventas:        'Registro de Ventas',
  vacunacion:    'Control de Vacunación',
  inventario:    'Inventario',
  clientes:      'Clientes y Cuentas por Cobrar',
  calendario:    'Calendario y Eventos',
  configuracion: 'Configuración del Rancho',
  empleados:     'Gestión de Empleados'
};

export default function Header({ activeView, userName, userRole, onToggleSidebar, alertCount = 3 }) {
  const { ranchoConfig } = useRancho();

  // Comprobación flexible para admin o administrador sin importar mayúsculas
  const rolNormalizado = userRole?.toLowerCase() || '';
  const roleLabel = (rolNormalizado === 'administrador' || rolNormalizado === 'admin') ? 'Administrador' : 'Empleado';
  
  const initials = userName
    ? userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US';

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-100 shadow-sm">
      {/* Izquierda: Toggle + Título */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-800 leading-tight">
            {VIEW_TITLES[activeView] ?? 'Puerta Pesada'}
          </h1>
          <p className="text-xs text-slate-400 leading-tight hidden sm:block">
            {ranchoConfig.nombreRancho} — Sistema de Gestión
          </p>
        </div>
      </div>

      {/* Derecha: notificaciones + usuario */}
      <div className="flex items-center gap-3">
        {/* Campanita */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
          )}
        </button>

        {/* Usuario */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-100 cursor-default select-none">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-slate-800">{userName || 'Usuario'}</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}