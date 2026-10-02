// src/views/forms/ConfiguracionForm.jsx — Formularios modulares con guías y selección estandarizada
import { useState } from 'react';

export function GeneralConfigForm({ configActual, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nombreRancho: configActual?.nombreRancho || '',
    logoUrl: configActual?.logoUrl || '/logo-Rancho.png',
    moneda: configActual?.moneda || 'MXN',
    unidadPeso: configActual?.unidadPeso || 'kg'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Editar Identidad del Rancho</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Rancho</label>
            <input
              type="text"
              required
              value={form.nombreRancho}
              onChange={e => setForm({ ...form, nombreRancho: e.target.value })}
              placeholder="Ej. Rancho Puerta Pesada"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Nombre oficial que aparecerá en el sistema y reportes.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Ruta o URL del Logo</label>
            <input
              type="text"
              required
              value={form.logoUrl}
              onChange={e => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="Ej. /logo-Rancho.png o URL externa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Ubicación local o enlace web de la imagen del logotipo.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Moneda</label>
              <select
                value={form.moneda}
                onChange={e => setForm({ ...form, moneda: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700"
              >
                <option value="MXN">MXN (Peso Mexicano)</option>
                <option value="USD">USD (Dólar)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unidad de Peso</label>
              <select
                value={form.unidadPeso}
                onChange={e => setForm({ ...form, unidadPeso: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700"
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="lb">Libras (lb)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CorralForm({ corralAEditar, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nombre: corralAEditar?.nombre || '',
    capacidadMaxima: corralAEditar?.capacidadMaxima || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">
          {corralAEditar ? 'Editar Corral' : 'Nuevo Corral'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Corral</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Corral Principal o Sector A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Capacidad Máxima</label>
            <input
              type="number"
              required
              min="1"
              value={form.capacidadMaxima}
              onChange={e => setForm({ ...form, capacidadMaxima: e.target.value })}
              placeholder="Ej. 50"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Número máximo de cabezas permitidas en este espacio.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              {corralAEditar ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TipoAnimalForm({ tipoAEditar, onSubmit, onCancel }) {
  const [nombre, setNombre] = useState(tipoAEditar?.nombre || 'Bovino');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nombre });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">
          {tipoAEditar ? 'Editar Tipo de Ganado' : 'Nuevo Tipo de Ganado'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Seleccionar Tipo de Ganado</label>
            <select
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="Bovino">Bovino (Res / Vacas / Toros)</option>
              <option value="Ovino">Ovino (Borregos / Ovejas)</option>
              <option value="Caprino">Caprino (Cabras / Chivos)</option>
              <option value="Porcino">Porcino (Cerdos / Puercos)</option>
              <option value="Equino">Equino (Caballos / Yeguas / Ponis)</option>
              <option value="Aves">Aves (Gallinas /plumas)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Selecciona la categoría oficial del catálogo pecuario.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              {tipoAEditar ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}