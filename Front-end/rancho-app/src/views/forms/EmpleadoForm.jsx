// src/views/forms/EmpleadoForm.jsx — Formulario reutilizable para crear y editar empleados
import { useState } from 'react';

export default function EmpleadoForm({ empleadoAEditar, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nombreCompleto: empleadoAEditar?.nombreCompleto || '',
    correo: empleadoAEditar?.correo || '',
    contrasenaHash: '',
    rol: empleadoAEditar?.rol || 'Empleado',
    puesto: empleadoAEditar?.puesto || 'Vaquero',
    telefono: empleadoAEditar?.telefono || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {empleadoAEditar ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={form.nombreCompleto}
              onChange={e => setForm({...form, nombreCompleto: e.target.value})}
              placeholder="Ej. Juan Pérez"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={form.correo}
              onChange={e => setForm({...form, correo: e.target.value})}
              placeholder="juan@puertapesada.mx"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              {empleadoAEditar ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal'}
            </label>
            <input
              type="password"
              required={!empleadoAEditar}
              value={form.contrasenaHash}
              onChange={e => setForm({...form, contrasenaHash: e.target.value})}
              placeholder={empleadoAEditar ? 'Dejar en blanco para mantener la actual' : '••••••••'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Rol (Sistema)</label>
              <select
                value={form.rol}
                onChange={e => setForm({...form, rol: e.target.value})}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Empleado">Empleado</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Puesto (Rancho)</label>
              <select
                value={form.puesto}
                onChange={e => setForm({...form, puesto: e.target.value})}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Capataz">Capataz</option>
                <option value="Veterinario">Veterinario</option>
                <option value="Vaquero">Vaquero</option>
                <option value="Encargado de Ordeña">Encargado de Ordeña</option>
                <option value="Administrador de Campo">Administrador de Campo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teléfono</label>
            <input
              type="text"
              value={form.telefono}
              onChange={e => setForm({...form, telefono: e.target.value})}
              placeholder="4181234567"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              {empleadoAEditar ? 'Guardar Cambios' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}