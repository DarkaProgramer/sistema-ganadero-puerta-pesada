// LoginView.jsx — Pantalla de acceso corporativa

import { useState } from 'react';
import { Eye, EyeOff, Beef, AlertCircle } from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '', rol: 'admin' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Credenciales demo
  const USUARIOS = {
    'admin@puertapesada.mx':    { pass: 'admin123',  rol: 'admin',    nombre: 'Marco Ruiz Soto' },
    'empleado@puertapesada.mx': { pass: 'emp123',    rol: 'empleado', nombre: 'Luis Herrera'     },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    // Simular latencia de red
    setTimeout(() => {
      const user = USUARIOS[form.email.toLowerCase()];
      if (user && user.pass === form.password && user.rol === form.rol) {
        onLogin({ nombre: user.nombre, rol: user.rol });
      } else {
        setError('Credenciales incorrectas. Verifica tu correo, contraseña y rol.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* ── Panel izquierdo (branding) ─────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-12 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-emerald-600/10 rounded-full" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white">PP</div>
          <div>
            <p className="font-bold text-white text-lg leading-tight">Puerta Pesada</p>
            <p className="text-emerald-400 text-xs">Sistema de Gestión Ganadera</p>
          </div>
        </div>

        {/* Tagline central */}
        <div className="relative z-10">
          <Beef size={64} className="text-emerald-500/40 mb-6" />
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Gestiona tu rancho<br />
            <span className="text-emerald-400">de forma digital</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Controla tu ganado, ventas, inventario, vacunación y más —
            todo en un solo lugar. Adiós a las libretas.
          </p>
        </div>

        {/* Footer branding */}
        <div className="relative z-10">
          <div className="flex gap-8 text-center">
            {[['127', 'Animales'], ['6', 'Clientes'], ['8', 'Ventas 2026']].map(([num, lab]) => (
              <div key={lab}>
                <p className="text-2xl font-bold text-emerald-400">{num}</p>
                <p className="text-slate-500 text-xs">{lab}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel derecho (formulario) ─────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50">
        {/* Logo mobile */}
        <div className="flex items-center gap-3 mb-8 lg:hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white">PP</div>
          <div>
            <p className="font-bold text-slate-800 text-lg leading-tight">Puerta Pesada</p>
            <p className="text-emerald-600 text-xs">Sistema de Gestión</p>
          </div>
        </div>

        {/* Card del formulario */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-800">Iniciar sesión</h1>
            <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales para continuar.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex gap-2 items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Selector de rol */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Rol de acceso
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'admin',    label: 'Administrador' },
                  { value: 'empleado', label: 'Empleado'      },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, rol: value }))}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.rol === value
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder={form.rol === 'admin' ? 'admin@puertapesada.mx' : 'empleado@puertapesada.mx'}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={form.rol === 'admin' ? 'admin123' : 'emp123'}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </>
              ) : 'Ingresar al sistema'}
            </button>
          </form>

          {/* Credenciales demo */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Credenciales de demo</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p><span className="font-medium text-slate-700">Admin:</span> admin@puertapesada.mx / admin123</p>
              <p><span className="font-medium text-slate-700">Empleado:</span> empleado@puertapesada.mx / emp123</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          © 2026 Rancho Puerta Pesada — Proyecto Integradora III
        </p>
      </div>
    </div>
  );
}
