// src/views/forms/HistorialAnimalForm.jsx — Formulario modular para Pesaje Individual (Crear / Editar)
import { useState } from 'react';

export function RegistrarPesoForm({ historicoAEditar, animal, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    fecha: historicoAEditar?.fecha ? historicoAEditar.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
    peso: historicoAEditar?.peso || '',
    etapa: historicoAEditar?.etapa || 'Engorda'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, peso: Number(form.peso) });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {historicoAEditar ? 'Editar Registro de Peso' : 'Registrar Pesaje Individual'}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Arete: <strong className="text-emerald-700">{animal?.areteBandera}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha de Pesaje</label>
            <input
              type="date"
              required
              value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Peso Registrado (kg)</label>
            <input
              type="number"
              step="0.01"
              required
              min="1"
              value={form.peso}
              onChange={e => setForm({ ...form, peso: e.target.value })}
              placeholder="Ej. 450.5"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Etapa de Desarrollo</label>
            <select
              value={form.etapa}
              onChange={e => setForm({ ...form, etapa: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="Crecimiento">Crecimiento</option>
              <option value="Engorda">Engorda</option>
              <option value="Reproduccion">Reproducción</option>
              <option value="Destete">Destete</option>
            </select>
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
              {historicoAEditar ? 'Guardar Cambios' : 'Guardar Peso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}