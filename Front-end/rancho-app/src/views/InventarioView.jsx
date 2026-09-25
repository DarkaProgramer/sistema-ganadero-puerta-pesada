// InventarioView.jsx — Activos y suministros del rancho

import { useState } from 'react';
import { Package, AlertTriangle, Wrench, CheckCircle2, Search } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { inventario } from '../data/mockData';

const CATEGORIAS = ['Todas', 'Vehículo', 'Equipo', 'Alimento', 'Veterinaria'];

export default function InventarioView() {
  const [categoriaActiva, setCategoria] = useState('Todas');
  const [busqueda, setBusqueda]          = useState('');

  const filtrados = inventario.filter(item => {
    const matchCat  = categoriaActiva === 'Todas' || item.categoria === categoriaActiva;
    const matchBusq = busqueda === '' || item.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  const disponibles    = inventario.filter(i => i.estado === 'disponible').length;
  const enReparacion   = inventario.filter(i => i.estado === 'en_reparacion').length;
  const stockBajo      = inventario.filter(i => i.estado === 'stock_bajo').length;

  const iconoEstado = (estado) => {
    if (estado === 'disponible')    return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (estado === 'en_reparacion') return <Wrench       size={14} className="text-amber-500"   />;
    if (estado === 'stock_bajo')    return <AlertTriangle size={14} className="text-red-500"     />;
    return null;
  };

  return (
    <div className="space-y-5">

      {/* ── KPIs ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-100 rounded-lg flex items-center justify-center"><CheckCircle2 size={20} className="text-emerald-600" /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Disponibles</p>
            <p className="text-2xl font-bold text-slate-800">{disponibles}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-100 rounded-lg flex items-center justify-center"><Wrench size={20} className="text-amber-600" /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">En reparación</p>
            <p className="text-2xl font-bold text-slate-800">{enReparacion}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle size={20} className="text-red-500" /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Stock bajo</p>
            <p className="text-2xl font-bold text-slate-800">{stockBajo}</p>
          </div>
        </div>
      </div>

      {/* ── Panel principal ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          {/* Tabs de categoría */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  categoriaActiva === cat
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar artículo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                {['Artículo', 'Categoría', 'Cantidad', 'Unidad', 'Ubicación', 'Última revisión', 'Estado'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    No se encontraron artículos.
                  </td>
                </tr>
              ) : filtrados.map(item => (
                <tr key={item.id} className={`hover:bg-slate-50/70 transition-colors ${item.estado !== 'disponible' ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {iconoEstado(item.estado)}
                      <span className="font-medium text-slate-800">{item.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">{item.categoria}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{item.cantidad.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-500">{item.unidad}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{item.ubicacion}</td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{item.ultimaRevision}</td>
                  <td className="px-5 py-3"><Badge estado={item.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-2.5 border-t border-slate-100 text-xs text-slate-400">
          {filtrados.length} artículo(s) mostrados de {inventario.length}
        </div>
      </div>

      {/* ── Alertas de stock bajo ────────────────────────── */}
      {stockBajo > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <h4 className="font-semibold text-red-700 text-sm">Artículos con stock bajo — requieren reabastecimiento</h4>
          </div>
          <div className="space-y-1.5">
            {inventario.filter(i => i.estado === 'stock_bajo').map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700 font-medium">{item.nombre}</span>
                <span className="text-red-500">{item.cantidad} {item.unidad} restantes</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
