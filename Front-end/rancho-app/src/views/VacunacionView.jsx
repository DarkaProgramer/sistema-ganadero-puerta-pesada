// VacunacionView.jsx — Historial de campañas sanitarias y registro rápido

import { useState } from 'react';
import { Plus, Syringe, Users, Calendar } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { vacunaciones as vacuInic, corrales } from '../data/mockData';

const VACUNAS_LISTA = [
  'Bovishield Gold 5', 'Ivermectina 1%', 'Carbón 7', 'Rabia Paralítica Bovina',
  'IBR + BVD (Combo)', 'Clostridiosis 7 cepas', 'Brucelosis RB51', 'Leptospirosis',
];

const RESPONSABLES = ['Dr. Carlos Torres', 'Ing. Luis Herrera', 'Ing. Marco Ruiz'];

const FORM_INIT = {
  fecha: new Date().toISOString().split('T')[0],
  vacuna: VACUNAS_LISTA[0],
  corral: corrales[0],
  cantidadAnimales: '',
  responsable: RESPONSABLES[0],
  dosis: '',
  lote: '',
  observaciones: '',
};

export default function VacunacionView({ showToast }) {
  const [campañas, setCampañas] = useState(vacuInic);
  const [modalOpen, setModal]   = useState(false);
  const [form, setForm]         = useState(FORM_INIT);
  const [error, setError]       = useState('');

  const totalAnimalesVacunados = campañas.reduce((s, c) => s + c.cantidadAnimales, 0);

  const handleRegistrar = (e) => {
    e.preventDefault();
    if (!form.cantidadAnimales || !form.lote) {
      setError('La cantidad de animales y el número de lote son requeridos.');
      return;
    }
    const nueva = {
      id: campañas.length + 1,
      ...form,
      cantidadAnimales: Number(form.cantidadAnimales),
    };
    setCampañas(prev => [nueva, ...prev]);
    setModal(false);
    setForm(FORM_INIT);
    setError('');
    showToast({ message: `Vacunación registrada: ${nueva.vacuna} en Corral ${nueva.corral}.`, type: 'success' });
  };

  return (
    <div className="space-y-5">

      {/* ── KPIs rápidos ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Syringe size={20} className="text-teal-600" />, bg: 'bg-teal-100', label: 'Campañas registradas', valor: campañas.length },
          { icon: <Users size={20} className="text-blue-600" />,   bg: 'bg-blue-100',  label: 'Animales vacunados',   valor: totalAnimalesVacunados },
          { icon: <Calendar size={20} className="text-violet-600" />, bg: 'bg-violet-100', label: 'Última campaña', valor: campañas[0]?.fecha ?? '—' },
        ].map(({ icon, bg, label, valor }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-slate-800">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabla de historial ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Historial de Campañas Sanitarias</h3>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Registrar campaña
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                {['Fecha', 'Vacuna / Medicamento', 'Corral', 'Animales', 'Dosis', 'Lote', 'Responsable', 'Observaciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {campañas.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.fecha}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.vacuna}</td>
                  <td className="px-4 py-3">
                    <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded">{c.corral}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">{c.cantidadAnimales}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.dosis}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.lote}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.responsable}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate" title={c.observaciones}>{c.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Registrar campaña ─────────────────────── */}
      <Modal open={modalOpen} onClose={() => { setModal(false); setError(''); }} title="Registrar Campaña de Vacunación">
        <form onSubmit={handleRegistrar} className="space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Corral</label>
              <select value={form.corral} onChange={e => setForm(f => ({ ...f, corral: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                {corrales.map(c => <option key={c} value={c}>Corral {c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Vacuna / Medicamento</label>
            <select value={form.vacuna} onChange={e => setForm(f => ({ ...f, vacuna: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              {VACUNAS_LISTA.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                N° Animales <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" value={form.cantidadAnimales} onChange={e => setForm(f => ({ ...f, cantidadAnimales: e.target.value }))}
                placeholder="Ej: 12"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Dosis aplicada</label>
              <input type="text" value={form.dosis} onChange={e => setForm(f => ({ ...f, dosis: e.target.value }))}
                placeholder="Ej: 5 ml"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                N° de Lote <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.lote} onChange={e => setForm(f => ({ ...f, lote: e.target.value }))}
                placeholder="Ej: VB-2026-007"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Responsable</label>
              <select value={form.responsable} onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Observaciones</label>
            <textarea rows={2} value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
              placeholder="Notas adicionales sobre la campaña..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setModal(false); setError(''); }}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors">Registrar campaña</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
