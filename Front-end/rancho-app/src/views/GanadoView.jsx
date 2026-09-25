// GanadoView.jsx — Gestión de ganado con tabla, filtros y modal de registro

import { useState } from 'react';
import { Plus, Search, Filter, Beef } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { animales as initialAnimales, corrales } from '../data/mockData';

const RAZAS    = ['Brahman', 'Angus', 'Charolais', 'Simmental', 'Cebú', 'Criollo'];
const ESTADOS  = ['activo', 'vendido', 'enfermo'];
const GENEROS  = ['Macho', 'Hembra'];

const FORM_INITIAL = {
  arete: '', nombre: '', raza: RAZAS[0], genero: GENEROS[0],
  fechaNacimiento: '', corral: corrales[0], peso: '',
};

export default function GanadoView({ showToast }) {
  const [animales, setAnimales] = useState(initialAnimales);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCorral, setFiltroCorral] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(FORM_INITIAL);
  const [formError, setFormError] = useState('');

  // ── Filtrado ──────────────────────────────────────────────
  const filtrados = animales.filter(a => {
    const matchEstado = filtroEstado === 'todos' || a.estado === filtroEstado;
    const matchCorral = filtroCorral === 'todos' || a.corral === filtroCorral;
    const matchBusq   = busqueda === '' || 
      a.arete.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchCorral && matchBusq;
  });

  // ── Conteos rápidos ───────────────────────────────────────
  const totalActivos  = animales.filter(a => a.estado === 'activo').length;
  const totalVendidos = animales.filter(a => a.estado === 'vendido').length;
  const totalEnfermos = animales.filter(a => a.estado === 'enfermo').length;

  // ── Registrar nuevo animal ────────────────────────────────
  const handleRegistrar = (e) => {
    e.preventDefault();
    if (!form.arete || !form.fechaNacimiento) {
      setFormError('El número de arete y la fecha de nacimiento son obligatorios.');
      return;
    }
    if (animales.find(a => a.arete === form.arete)) {
      setFormError(`El arete ${form.arete} ya está registrado.`);
      return;
    }
    const nuevo = {
      id: animales.length + 1,
      arete: form.arete,
      nombre: form.nombre || '—',
      raza: form.raza,
      genero: form.genero,
      fechaNacimiento: form.fechaNacimiento,
      corral: form.corral,
      estado: 'activo',
      peso: Number(form.peso) || 0,
    };
    setAnimales(prev => [nuevo, ...prev]);
    setModalOpen(false);
    setForm(FORM_INITIAL);
    setFormError('');
    showToast({ message: `Animal ${nuevo.arete} registrado exitosamente.`, type: 'success' });
  };

  const calcEdad = (fechaNac) => {
    const hoy   = new Date();
    const nac   = new Date(fechaNac);
    const meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
    if (meses < 12) return `${meses} meses`;
    return `${Math.floor(meses / 12)} años`;
  };

  return (
    <div className="space-y-5">

      {/* ── Chips de resumen ─────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Activos',   count: totalActivos,  color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Vendidos',  count: totalVendidos, color: 'text-slate-600 bg-slate-50 border-slate-200'       },
          { label: 'Enfermos',  count: totalEnfermos, color: 'text-red-700 bg-red-50 border-red-200'             },
          { label: 'Total',     count: animales.length, color: 'text-slate-700 bg-white border-slate-200 font-semibold' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`px-4 py-2 rounded-lg border text-sm ${color}`}>
            <span className="font-bold text-base mr-1">{count}</span>{label}
          </div>
        ))}
      </div>

      {/* ── Barra de herramientas ────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
          {/* Búsqueda */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por arete o nombre..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filtros y botón */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Filtro estado */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600">
              <Filter size={13} className="text-slate-400" />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="todos">Todos los estados</option>
                {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </div>

            {/* Filtro corral */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600">
              <select
                value={filtroCorral}
                onChange={e => setFiltroCorral(e.target.value)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="todos">Todos los corrales</option>
                {corrales.map(c => <option key={c} value={c}>Corral {c}</option>)}
              </select>
            </div>

            {/* Botón nuevo */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Registrar animal
            </button>
          </div>
        </div>

        {/* ── Tabla ──────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                {['Arete', 'Nombre', 'Raza', 'Género', 'Edad', 'Peso (kg)', 'Corral', 'Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                    <Beef size={32} className="mx-auto mb-2 opacity-30" />
                    No se encontraron animales con los filtros aplicados.
                  </td>
                </tr>
              ) : filtrados.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">{a.arete}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{a.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{a.raza}</td>
                  <td className="px-4 py-3 text-slate-600">{a.genero}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{calcEdad(a.fechaNacimiento)}</td>
                  <td className="px-4 py-3 text-slate-600">{a.peso}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded">
                      {a.corral}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge estado={a.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
          Mostrando {filtrados.length} de {animales.length} animales
        </div>
      </div>

      {/* ── Modal: Registrar Animal ──────────────────────── */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setFormError(''); }} title="Registrar Nuevo Animal">
        <form onSubmit={handleRegistrar} className="space-y-4">
          {formError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Arete */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                N° de Arete <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.arete}
                onChange={e => setForm(f => ({ ...f, arete: e.target.value }))}
                placeholder="Ej: PP-016"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Nombre */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Nombre (opcional)</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej: El Bravo"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Raza */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Raza</label>
              <select
                value={form.raza}
                onChange={e => setForm(f => ({ ...f, raza: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {RAZAS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Género</label>
              <div className="grid grid-cols-2 gap-2">
                {GENEROS.map(g => (
                  <button
                    key={g} type="button"
                    onClick={() => setForm(f => ({ ...f, genero: g }))}
                    className={`py-2 text-sm rounded-lg border font-medium transition-all ${
                      form.genero === g
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-emerald-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha nacimiento */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.fechaNacimiento}
                onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Peso inicial (kg)</label>
              <input
                type="number"
                min="0"
                value={form.peso}
                onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                placeholder="Ej: 320"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Corral */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Corral asignado</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {corrales.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setForm(f => ({ ...f, corral: c }))}
                    className={`py-2 text-sm rounded-lg border font-semibold transition-all ${
                      form.corral === c
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-emerald-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setModalOpen(false); setFormError(''); }}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Registrar Animal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
