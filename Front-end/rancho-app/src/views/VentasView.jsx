// VentasView.jsx — Gestión de ventas y compras con historial, filtros y métricas (Tarjeta 3)
import { useCallback, useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Scale, Clock, ShoppingCart, BadgeDollarSign, Search, FileText, Beef, FilterX,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import ComprobanteTransaccion from '../components/ui/ComprobanteTransaccion';
import TransaccionForm from './forms/TransaccionForm';
import { useRancho } from '../context/RanchoContext';
import { api, formatoFecha, formatoMoneda } from '../utils/http';

const ESTADO_CLS = {
  Pagado: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Pendiente: 'bg-amber-100 text-amber-700 ring-amber-200',
  Cancelado: 'bg-slate-100 text-slate-500 ring-slate-200 line-through',
};
const FILTROS_VACIOS = { tipo: '', estado: '', desde: '', hasta: '', q: '' };

const nombreMes = (yyyyMm) => new Date(`${yyyyMm}-15T12:00:00`).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });

export default function VentasView({ showToast, usuario }) {
  const { ranchoConfig } = useRancho();
  const moneda = ranchoConfig.moneda || 'MXN';
  const [transacciones, setTransacciones] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [catalogos, setCatalogos] = useState(null);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [formTipo, setFormTipo] = useState(null);       // 'Venta' | 'Compra'
  const [comprobante, setComprobante] = useState(null); // transacción

  const notificar = useCallback((message, type = 'success') => (showToast ? showToast({ message, type }) : alert(message)), [showToast]);

  const cargar = useCallback(async () => {
    try {
      const rango = { desde: filtros.desde, hasta: filtros.hasta };
      const [lista, res] = await Promise.all([
        api('/api/transacciones', { query: filtros }),
        api('/api/transacciones/resumen', { query: rango }),
      ]);
      setTransacciones(lista); setResumen(res); setError('');
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, [filtros]);

  useEffect(() => {
    const t = setTimeout(cargar, filtros.q ? 300 : 0);
    return () => clearTimeout(t);
  }, [cargar, filtros.q]);

  const abrirFormulario = async (tipo) => {
    try {
      setCatalogos(await api('/api/transacciones/catalogos'));
      setFormTipo(tipo);
    } catch (e) { notificar(e.message, 'error'); }
  };

  const registrar = async (cuerpo) => {
    try {
      const r = await api('/api/transacciones', { method: 'POST', body: { ...cuerpo, idEmpleado: usuario?.idEmpleado } });
      setFormTipo(null);
      await cargar();
      notificar(r.message);
      setComprobante(r.transaccion);
    } catch (e) { notificar(e.message, 'error'); }
  };

  const cambiarEstado = async (t, estado) => {
    if (estado === t.estado) return;
    if (estado === 'Cancelado' && !confirm(`¿Cancelar ${t.folio}? ${t.tipo === 'Venta' ? 'Los animales vendidos volverán a estar "Vivo" y' : ''} el stock de inventario se revertirá.`)) return;
    try {
      const r = await api(`/api/transacciones/${t.idTransaccion}/estado`, { method: 'PATCH', body: { estado, idEmpleado: usuario?.idEmpleado } });
      await cargar(); notificar(r.message);
    } catch (e) { notificar(e.message, 'error'); }
  };

  const set = (k) => (e) => setFiltros({ ...filtros, [k]: e.target.value });
  const hayFiltros = Object.values(filtros).some(Boolean);
  const maxMes = Math.max(1, ...(resumen?.porMes || []).map(m => Math.max(m.ingresos, m.egresos)));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BadgeDollarSign className="text-emerald-600" /> Ventas y Compras</h1>
          <p className="text-slate-500 text-sm mt-1">Transacciones de ganado, insumos y herramientas.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => abrirFormulario('Compra')} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm">
            <ShoppingCart size={17} /> Nueva compra
          </button>
          <button onClick={() => abrirFormulario('Venta')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm">
            <TrendingUp size={17} /> Nueva venta
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {/* Métricas */}
      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            ['Ingresos (ventas)', formatoMoneda(resumen.ingresos, moneda), TrendingUp, 'text-emerald-600', `${resumen.cabezasVendidas} cabezas vendidas`],
            ['Egresos (compras)', formatoMoneda(resumen.egresos, moneda), TrendingDown, 'text-red-600', `${resumen.cabezasCompradas} cabezas compradas`],
            ['Balance', formatoMoneda(resumen.balance, moneda), Scale, resumen.balance >= 0 ? 'text-emerald-700' : 'text-red-700', `${resumen.operaciones} operaciones`],
            ['Por cobrar', formatoMoneda(resumen.porCobrar, moneda), Clock, 'text-amber-600', 'Ventas pendientes'],
            ['Por pagar', formatoMoneda(resumen.porPagar, moneda), Clock, 'text-orange-600', 'Compras pendientes'],
          ].map(([label, valor, Icon, color, sub]) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500"><Icon size={15} className={color} /> {label}</div>
              <p className={`text-xl font-bold mt-2 ${color}`}>{valor}</p>
              <p className="text-[11px] text-slate-400">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ingresos vs egresos por mes */}
      {resumen?.porMes?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800 text-sm">Ingresos vs. egresos por mes</p>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Ingresos</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" /> Egresos</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {resumen.porMes.slice(-6).map(m => (
              <div key={m.mes} className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <span className="text-xs text-slate-500 capitalize">{nombreMes(m.mes)}</span>
                <div className="space-y-1">
                  {[['ingresos', 'bg-emerald-500'], ['egresos', 'bg-red-400']].map(([k, color]) => (
                    <div key={k} className="flex items-center gap-2">
                      <div className={`h-2.5 rounded-sm ${color}`} style={{ width: `${Math.max(0.5, (m[k] / maxMes) * 85)}%` }} />
                      <span className="text-[11px] text-slate-500 whitespace-nowrap">{formatoMoneda(m[k], moneda)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div className="relative lg:col-span-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filtros.q} onChange={set('q')} placeholder="Folio, cliente, proveedor o arete"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
        <select value={filtros.tipo} onChange={set('tipo')} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">Ventas y compras</option><option value="Venta">Solo ventas</option><option value="Compra">Solo compras</option>
        </select>
        <select value={filtros.estado} onChange={set('estado')} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">Cualquier estado</option><option>Pagado</option><option>Pendiente</option><option>Cancelado</option>
        </select>
        <label className="text-[11px] text-slate-500">Desde<input type="date" value={filtros.desde} onChange={set('desde')} className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm" /></label>
        <div className="flex gap-2 items-end">
          <label className="text-[11px] text-slate-500 flex-1">Hasta<input type="date" value={filtros.hasta} onChange={set('hasta')} className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm" /></label>
          {hayFiltros && <button onClick={() => setFiltros(FILTROS_VACIOS)} title="Limpiar filtros" className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"><FilterX size={16} /></button>}
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {cargando ? <p className="p-12 text-center text-slate-400 text-sm">Cargando transacciones…</p>
          : transacciones.length === 0 ? <p className="p-12 text-center text-slate-400 text-sm">{hayFiltros ? 'Ninguna transacción coincide con los filtros.' : 'Aún no hay transacciones registradas.'}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Folio</th><th className="py-3 px-5">Fecha</th><th className="py-3 px-5">Cliente / Proveedor</th>
                  <th className="py-3 px-5">Conceptos</th><th className="py-3 px-5 text-right">Total</th><th className="py-3 px-5">Estado</th><th className="py-3 px-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacciones.map(t => {
                  const cabezas = t.detalles.filter(d => d.concepto === 'Animal').length;
                  return (
                    <tr key={t.idTransaccion} className="hover:bg-slate-50/60">
                      <td className="py-3 px-5">
                        <p className="font-semibold text-slate-800">{t.folio}</p>
                        <span className={`text-[11px] font-semibold ${t.tipo === 'Venta' ? 'text-emerald-600' : 'text-slate-500'}`}>{t.tipo}</span>
                      </td>
                      <td className="py-3 px-5 text-slate-500 whitespace-nowrap">{formatoFecha(t.fecha)}</td>
                      <td className="py-3 px-5 text-slate-700">{t.tipo === 'Venta' ? t.cliente?.nomCliente : t.proveedor?.nombre}</td>
                      <td className="py-3 px-5 text-xs text-slate-500 max-w-xs">
                        {cabezas > 0 && <span className="inline-flex items-center gap-1 mr-2 font-semibold text-slate-700"><Beef size={12} /> {cabezas}</span>}
                        {t.detalles.map(d => d.descripcion).join(', ')}
                      </td>
                      <td className={`py-3 px-5 text-right font-bold whitespace-nowrap ${t.tipo === 'Venta' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {t.tipo === 'Venta' ? '+' : '−'}{formatoMoneda(t.total, moneda)}
                      </td>
                      <td className="py-3 px-5">
                        {t.estado === 'Cancelado' ? (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ESTADO_CLS.Cancelado}`}>Cancelado</span>
                        ) : (
                          <select value={t.estado} onChange={e => cambiarEstado(t, e.target.value)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset border-0 cursor-pointer ${ESTADO_CLS[t.estado]}`}>
                            <option>Pagado</option><option>Pendiente</option><option>Cancelado</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button onClick={() => setComprobante(t)} title="Ver comprobante" className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"><FileText size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!formTipo} onClose={() => setFormTipo(null)} title={formTipo === 'Venta' ? 'Registrar venta' : 'Registrar compra'} maxWidth="max-w-3xl">
        {formTipo && catalogos && (
          <TransaccionForm tipo={formTipo} catalogos={catalogos} moneda={moneda} onSubmit={registrar} onCancel={() => setFormTipo(null)} />
        )}
      </Modal>
      <Modal open={!!comprobante} onClose={() => setComprobante(null)} title={`Comprobante ${comprobante?.folio || ''}`} maxWidth="max-w-3xl">
        {comprobante && <ComprobanteTransaccion transaccion={comprobante} />}
      </Modal>
    </div>
  );
}
