// LoginView.jsx — Pantalla de acceso corporativa conectada al Backend
import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRancho } from '../context/RanchoContext';

export default function LoginView({ onLogin }) {
  const { ranchoConfig } = useRancho();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const respuesta = await fetch('http://localhost:4000/api/empleados/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: form.email.toLowerCase(),
          contrasenaHash: form.password
        })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        onLogin({ 
          nombre: datos.empleado.nombreCompleto, 
          rol: datos.empleado.rol.toLowerCase() 
        });
      } else {
        setError(datos.error || 'Credenciales incorrectas.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('No se pudo conectar con el servidor backend. Verifica que esté encendido.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Panel izquierdo (branding dinámico con logo mucho más grande y elegante) ─────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-16 relative overflow-hidden border-r border-slate-800/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Logo superior con tamaño generoso (w-20 h-20) */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-45 h-35 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 overflow-hidden flex items-center justify-center shadow-2xl shadow-emerald-950/60 backdrop-blur-md">
            {!imgError ? (
              <img 
                src={ranchoConfig.logoUrl} 
                alt="Logo Rancho" 
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="font-bold text-white text-xl">PP</span>
            )}
          </div>
          <div>
            <p className="font-bold text-white text-4xl tracking-wide">{ranchoConfig.nombreRancho}</p>
            <p className="text-emerald-400 text-sm font-medium tracking-wide">Plataforma Integral Ganadera</p>
          </div>
        </div>

        {/* Texto central */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <ShieldCheck size={14} /> Acceso Seguro al Sistema
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Control total de tu rancho, <span className="text-emerald-400">sin complicaciones.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Administra personal, ganado, inventarios y trazabilidad operativa desde un entorno centralizado y seguro.
          </p>
        </div>

        <div className="relative z-10 text-slate-500 text-xs">
          Sistema Autorizado — Módulo Operativo 2026
        </div>
      </div>

      {/* ── Panel derecho (formulario) ─────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
          
          {/* Logo móvil adaptado */}
          <div className="flex items-center gap-3.5 mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 overflow-hidden flex items-center justify-center shadow-md">
              <img 
                src={ranchoConfig.logoUrl} 
                alt="Logo" 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.src = 'https://placehold.co/60?text=PP'; }} 
              />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">{ranchoConfig.nombreRancho}</p>
              <p className="text-emerald-600 text-xs font-medium">Sistema de Gestión</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales institucionales para acceder.</p>
          </div>

          {error && (
            <div className="mb-6 flex gap-3 items-start p-4 bg-red-50 border border-red-200 rounded-2xl">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="nombre@puertapesada.mx"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validando acceso...
                  </>
                ) : 'Ingresar al sistema'}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-xs text-slate-400 font-medium">
          © 2026 {ranchoConfig.nombreRancho} — Proyecto Integradora III
        </p>
      </div>
    </div>
  );
}