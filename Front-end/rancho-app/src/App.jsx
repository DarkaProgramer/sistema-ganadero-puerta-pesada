// App.jsx — Punto de entrada y router de vistas por estado

import { useState, useCallback } from 'react';

// Layout
import Sidebar from './components/layout/Sidebar';
import Header  from './components/layout/Header';

// UI
import Toast from './components/ui/Toast';

// Vistas
import LoginView      from './views/LoginView';
import DashboardView  from './views/DashboardView';
import GanadoView     from './views/GanadoView';
import VentasView     from './views/VentasView';
import VacunacionView from './views/VacunacionView';
import InventarioView from './views/InventarioView';
import ClientesView   from './views/ClientesView';
import CalendarioView from './views/CalendarioView';
import EmpleadosView  from './views/EmpleadosView';
import ConfiguracionView from './views/ConfiguracionView'; // <-- 1. Importar la vista

// ─── Mapa de vistas ───────────────────────────────────────────
const VIEWS = {
  dashboard:     DashboardView,
  ganado:        GanadoView,
  ventas:        VentasView,
  vacunacion:    VacunacionView,
  inventario:    InventarioView,
  clientes:      ClientesView,
  calendario:    CalendarioView,
  empleados:     EmpleadosView,
  configuracion: ConfiguracionView, // <-- 2. Registrar la vista en el mapa
};

export default function App() {
  // ── Estado global ──────────────────────────────────────────
  const [isLoggedIn,       setIsLoggedIn]       = useState(false);
  const [user,             setUser]             = useState(null);           // { nombre, rol }
  const [activeView,       setActiveView]       = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast,            setToast]            = useState(null);           // { message, type }

  // ── Toast helper ───────────────────────────────────────────
  const showToast = useCallback((payload) => setToast(payload), []);
  const hideToast = useCallback(() => setToast(null), []);

  // ── Login / Logout ─────────────────────────────────────────
  const handleLogin  = (userData) => { setUser(userData); setIsLoggedIn(true); };
  const handleLogout = () => { setIsLoggedIn(false); setUser(null); setActiveView('dashboard'); };

  // ── Vista activa ──────────────────────────────────────────
  const ActiveView = VIEWS[activeView] ?? DashboardView;

  // ── Render Login ──────────────────────────────────────────
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  // ── Render App Shell ──────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
      />

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <Header
          activeView={activeView}
          userName={user?.nombre}
          userRole={user?.rol}
          onToggleSidebar={() => setSidebarCollapsed(c => !c)}
          alertCount={3}
        />

        {/* Contenido de la vista activa */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ActiveView
            setActiveView={setActiveView}
            showToast={showToast}
            usuario={user} // Pasamos el objeto completo { nombre, rol } para validar permisos de admin
          />
        </main>
      </div>

      {/* Toast global */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
