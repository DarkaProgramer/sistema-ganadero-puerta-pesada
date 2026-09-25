// VentasView.jsx — Registro y listado de ventas

import { useState } from 'react';
import { Plus, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { ventas as ventasIniciales, clientes, animales } from '../data/mockData';

const METODOS_PAGO = ['contado', 'transferencia', 'crédito', 'parcialidades'];
const FORM_INIT = { clienteId: '', fecha: new Date().toISOString().split('T')[0], aretesInvolucrados: '', total: '', metodoPago: 'contado', notas: '' };

export default function VentasView({ showToast }) {
  const [ventas, setVentas]   = useState(ventasIniciales);
  const [modalOpen, setModal] = useState(false);
  const [form, setForm]       = useState(FORM_INIT);
  const [error, setError]     = useState('');

  const totalMes = ventas.filter(v => v.estado === 'pagado').reduce((s, v) => s + v.total, 0);
  const pendiente = ventas.filter(v => v.estado !== 'pagado').reduce((s, v) => s + v.total, 0);

  const handleRegistrar = (e) => {
    e.preventDefault();
    if (!form.clienteId || !form.total) { setError('Cliente y total son requeridos.'); return; }
    const cliente = clientes.find(c => c.id === Number(form.clienteId));
    const aretes  = form.aretesInvolucrados.split(',').map(a => a.trim()).filter(Boolean);
    const nueva = {
      id: ventas.length + 1,
      folio: `VT-2026-${String(ventas.length + 1).padStart(3, '0')}`,
      fecha: form.fecha,
      clienteId: Number(form.clienteId),
      cliente: cliente?.nombre ?? 'Desconocido',
      animales: aretes,
      cabezas: aretes.length || 1,
      total: Number(form.total),
      metodoPago: form.metodoPago,
      estado: form.metodoPago === 'contado' || form.metodoPago === 'transferencia' ? 'pagado' : 'pendiente',
    };
    setVentas(prev => [nueva, ...prev]);
    setModal(false);
    setForm(FORM_INIT);
    setError('');
    showToast({ message: `Venta ${nueva.folio} registrada por $${Number(form.total).toLocaleString('es-MX')}.`, type: 'success' });
  };

  return (
    <div className="space-y-5">

      {/* ── KPIs ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-100 rounded-lg flex items-center justify-center"><TrendingUp size={20} className="text-emerald-600" /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total cobrado</p>
            <p className="text-xl font-bold text-slate-800">${totalMes.toLocaleString('es-MX')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-100 rounded-lg flex items-center justify-center"><DollarSign size={20} className="text-amber-600" /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Por cobrar</p>
            <p className="text-xl font-bold text-slate-800">${pendiente.toLocaleString('es-MX')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center"><ShoppingCart size={20} className="text-blue-600" /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Transacciones</p>
            <p className="text-xl font-bold text-slate-800">{ventas.length}</p>
          </div>
        </div>
      </div>

      {/* ── Tabla ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Historial de Transacciones</h3>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Nueva venta
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                {['Folio', 'Fecha', 'Cliente', 'Cabezas', 'Método Pago', 'Total', 'Estado'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ventas.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-500">{v.folio}</td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{v.fecha}</td>
                  <td className="px-5 py-3 text-slate-700 font-medium max-w-[180px] truncate">{v.cliente}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">{v.cabezas}</span>
                  </td>
                  <td className="px-5 py-3"><Badge estado={v.metodoPago} /></td>
                  <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">${v.total.toLocaleString('es-MX')}</td>
                  <td className="px-5 py-3"><Badge estado={v.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Nueva venta ──────────────────────────── */}
      <Modal open={modalOpen} onClose={() => { setModal(false); setError(''); }} title="Registrar Nueva Venta">
        <form onSubmit={handleRegistrar} className="space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={form.clienteId}
              onChange={e => setForm(f => ({ ...f, clienteId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Seleccionar cliente —</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Total (MXN) <span className="text-red-500">*</span>
              </label>
              <input type="number" min="0" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))}
                placeholder="Ej: 75000"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Aretes involucrados</label>
            <input type="text" value={form.aretesInvolucrados} onChange={e => setForm(f => ({ ...f, aretesInvolucrados: e.target.value }))}
              placeholder="PP-001, PP-002 (separados por coma)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <p className="text-xs text-slate-400 mt-1">Separa múltiples aretes con coma.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Método de Pago</label>
            <div className="grid grid-cols-2 gap-2">
              {METODOS_PAGO.map(m => (
                <button key={m} type="button" onClick={() => setForm(f => ({ ...f, metodoPago: m }))}
                  className={`py-2 text-sm rounded-lg border font-medium transition-all ${form.metodoPago === m ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-400'}`}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setModal(false); setError(''); }}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">Registrar Venta</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
