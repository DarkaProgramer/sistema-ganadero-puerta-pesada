// InventarioView.jsx — Inventario diferenciado Herramientas vs. Consumibles con alertas y umbrales (Tarjeta 2)
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Package, Wrench, FlaskConical, AlertTriangle, AlertOctagon, Plus, Minus, ArrowDownToLine, Undo2,
  Pencil, Trash2, Search, SlidersHorizontal, History, Handshake, Save,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { api, esAdmin, formatoFecha, hoyISO } from '../utils/http';

const NIVEL = {
  critico: { label: 'Crítico',     barra: 'bg-red-500',     fila: 'bg-red-50/60',   chip: 'bg-red-100 text-red-700 ring-red-200' },
  bajo:    { label: 'Insuficiente', barra: 'bg-amber-400',  fila: 'bg-amber-50/50', chip: 'bg-amber-100 text-amber-700 ring-amber-200' },
  ok:      { label: 'Suficiente',  barra: 'bg-emerald-500', fila: '',               chip: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
};

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white';
const ARTICULO_VACIO = { nombre: '', tipo: 'Consumible', categoria: '', cantidadActual: 0, unidad: 'pieza', stockMinimo: 5, stockCritico: 2, ubicacion: '', descripcion: '' };

function NivelChip({ nivel }) {
  const cfg = NIVEL[nivel] || NIVEL.ok;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cfg.chip}`}>{cfg.label}</span>;
}

// Barra de stock: llena según cantidad respecto al doble del mínimo, con marcas de los umbrales
function BarraStock({ item }) {
  const tope = Math.max(item.stockMinimo * 2, item.cantidadActual, 1);
  const pct = (v) => `${Math.min(100, (v / tope) * 100)}%`;
  return (
    <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden" title={`Mínimo ${item.stockMinimo} · Crítico ${item.stockCritico}`}>
      <div className={`h-full rounded-full ${NIVEL[item.nivel].barra}`} style={{ width: pct(item.cantidadActual) }} />
      <span className="absolute top-0 h-full w-px bg-amber-600/70" style={{ left: pct(item.stockMinimo) }} />
      <span className="absolute top-0 h-full w-px bg-red-600/70" style={{ left: pct(item.stockCritico) }} />
    </div>
  );
}

function ArticuloForm({ inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState(inicial);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {['Herramienta', 'Consumible'].map(t => (
          <button type="button" key={t} onClick={() => setForm({ ...form, tipo: t })}
            className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 justify-center transition ${form.tipo === t ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {t === 'Herramienta' ? <Wrench size={16} /> : <FlaskConical size={16} />} {t === 'Consumible' ? 'Insumo / Consumible' : t}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        {form.tipo === 'Herramienta' ? 'Las herramientas se prestan y se devuelven.' : 'Los consumibles (medicamentos, alimento…) se descuentan al usarse.'}
      </p>
      <input required value={form.nombre} onChange={set('nombre')} placeholder="Nombre del artículo" className={inputCls} />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.categoria} onChange={set('categoria')} placeholder={form.tipo === 'Herramienta' ? 'Categoría (Manejo, Taller…)' : 'Categoría (Medicamento, Alimento…)'} className={inputCls} />
        <input required value={form.unidad} onChange={set('unidad')} placeholder="Unidad (pieza, bulto, frasco)" className={inputCls} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs font-semibold text-slate-500 uppercase">Stock {inicial.idInventario ? 'actual' : 'inicial'}
          <input type="number" min="0" disabled={!!inicial.idInventario} value={form.cantidadActual} onChange={set('cantidadActual')} className={`${inputCls} mt-1 disabled:bg-slate-50`} />
        </label>
        <label className="text-xs font-semibold text-amber-600 uppercase">Mínimo
          <input type="number" min="0" required value={form.stockMinimo} onChange={set('stockMinimo')} className={`${inputCls} mt-1`} />
        </label>
        <label className="text-xs font-semibold text-red-600 uppercase">Crítico
          <input type="number" min="0" required value={form.stockCritico} onChange={set('stockCritico')} className={`${inputCls} mt-1`} />
        </label>
      </div>
      {inicial.idInventario && <p className="text-xs text-slate-400 -mt-2">El stock se modifica con entradas, salidas o préstamos para conservar el historial.</p>}
      <input value={form.ubicacion || ''} onChange={set('ubicacion')} placeholder="Ubicación (bodega, botiquín…)" className={inputCls} />
      <textarea rows={2} value={form.descripcion || ''} onChange={set('descripcion')} placeholder="Descripción u observaciones" className={inputCls} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
        <button type="submit" className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">Guardar</button>
      </div>
    </form>
  );
}

function MovimientoForm({ item, tipoMovimiento, empleados, usuario, onSubmit, onCancel }) {
  const [form, setForm] = useState({ cantidad: 1, motivo: '', fecha: hoyISO(), idEmpleado: usuario?.idEmpleado || '' });
  const textos = {
    Entrada: { titulo: 'Registrar entrada', boton: 'Agregar al stock', placeholder: 'Ej. compra a proveedor, reabastecimiento' },
    Salida: { titulo: 'Registrar consumo', boton: 'Descontar del stock', placeholder: 'Ej. desparasitación corral 1, ración diaria' },
    Prestamo: { titulo: 'Prestar herramienta', boton: 'Registrar préstamo', placeholder: 'Ej. aretado de becerros' },
  }[tipoMovimiento];
  const max = tipoMovimiento === 'Entrada' ? undefined : item.cantidadActual;
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, tipoMovimiento, cantidad: Number(form.cantidad) }); }} className="space-y-4">
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
        <p className="font-semibold text-slate-700">{item.nombre}</p>
        <p className="text-xs text-slate-500">Disponible: {item.cantidadActual} {item.unidad} · {textos.titulo}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-slate-500 uppercase">Cantidad ({item.unidad})
          <input type="number" min="1" max={max} required value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} className={`${inputCls} mt-1`} />
        </label>
        <label className="text-xs font-semibold text-slate-500 uppercase">Fecha
          <input type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className={`${inputCls} mt-1`} />
        </label>
      </div>
      <label className="block text-xs font-semibold text-slate-500 uppercase">{tipoMovimiento === 'Prestamo' ? 'Se presta a' : 'Registrado por'}
        <select required value={form.idEmpleado} onChange={e => setForm({ ...form, idEmpleado: e.target.value })} className={`${inputCls} mt-1`}>
          <option value="">Selecciona un empleado</option>
          {empleados.map(e => <option key={e.idEmpleado} value={e.idEmpleado}>{e.nombreCompleto}</option>)}
        </select>
      </label>
      <input value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} placeholder={textos.placeholder} className={inputCls} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
        <button type="submit" className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">{textos.boton}</button>
      </div>
    </form>
  );
}

export default function InventarioView({ showToast, usuario }) {
  const admin = esAdmin(usuario);
  const [items, setItems] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pestana, setPestana] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalArticulo, setModalArticulo] = useState(null);       // objeto del formulario
  const [modalMovimiento, setModalMovimiento] = useState(null);   // { item, tipoMovimiento }
  const [umbrales, setUmbrales] = useState({});

  const notificar = useCallback((message, type = 'success') => (showToast ? showToast({ message, type }) : alert(message)), [showToast]);

  const cargar = useCallback(async () => {
    try {
      const [lista, res, movs, emps] = await Promise.all([
        api('/api/inventario'), api('/api/inventario/resumen'), api('/api/inventario/movimientos'), api('/api/empleados'),
      ]);
      setItems(lista); setResumen(res); setMovimientos(movs);
      setEmpleados(emps.filter(e => (e.estatus || 'Activo') !== 'Inactivo'));
      setUmbrales(Object.fromEntries(lista.map(i => [i.idInventario, { stockMinimo: i.stockMinimo, stockCritico: i.stockCritico }])));
      setError('');
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { const t = setTimeout(cargar, 0); return () => clearTimeout(t); }, [cargar]);

  const prestamosActivos = movimientos.filter(m => m.estadoPrestamo === 'Prestado');
  const alertas = items.filter(i => i.nivel !== 'ok').sort((a, b) => (a.nivel === 'critico' ? -1 : 1) - (b.nivel === 'critico' ? -1 : 1));

  const visibles = useMemo(() => items.filter(i =>
    (pestana === 'herramientas' ? i.tipo === 'Herramienta' : pestana === 'consumibles' ? i.tipo === 'Consumible' : pestana === 'alertas' ? i.nivel !== 'ok' : true) &&
    (!busqueda || `${i.nombre} ${i.categoria} ${i.ubicacion || ''}`.toLowerCase().includes(busqueda.toLowerCase()))
  ), [items, pestana, busqueda]);

  const guardarArticulo = async (form) => {
    try {
      if (form.idInventario) await api(`/api/inventario/${form.idInventario}`, { method: 'PUT', body: form });
      else await api('/api/inventario', { method: 'POST', body: form });
      setModalArticulo(null); await cargar();
      notificar('Artículo guardado.');
    } catch (e) { notificar(e.message, 'error'); }
  };

  const registrarMovimiento = async (datos) => {
    try {
      const r = await api(`/api/inventario/${modalMovimiento.item.idInventario}/movimientos`, { method: 'POST', body: datos });
      setModalMovimiento(null); await cargar();
      notificar(r.item.nivel === 'ok' ? 'Movimiento registrado.' : `Movimiento registrado. ⚠️ ${r.item.nombre} quedó en nivel ${NIVEL[r.item.nivel].label.toLowerCase()}.`, r.item.nivel === 'ok' ? 'success' : 'info');
    } catch (e) { notificar(e.message, 'error'); }
  };

  const devolver = async (mov) => {
    try {
      await api(`/api/inventario/movimientos/${mov.idMovimiento}/devolver`, { method: 'POST', body: { idEmpleado: usuario?.idEmpleado } });
      await cargar(); notificar(`${mov.inventario.nombre} devuelto.`);
    } catch (e) { notificar(e.message, 'error'); }
  };

  const darDeBaja = async (item) => {
    if (!confirm(`¿Dar de baja "${item.nombre}"? Su historial se conserva.`)) return;
    try { await api(`/api/inventario/${item.idInventario}`, { method: 'DELETE' }); await cargar(); notificar('Artículo dado de baja.'); }
    catch (e) { notificar(e.message, 'error'); }
  };

  const guardarUmbrales = async () => {
    const cambiados = items.filter(i => umbrales[i.idInventario] &&
      (Number(umbrales[i.idInventario].stockMinimo) !== i.stockMinimo || Number(umbrales[i.idInventario].stockCritico) !== i.stockCritico));
    if (!cambiados.length) return notificar('No hay cambios que guardar.', 'info');
    try {
      await api('/api/inventario/umbrales', { method: 'PUT', body: { umbrales: cambiados.map(i => ({ idInventario: i.idInventario, ...umbrales[i.idInventario] })) } });
      await cargar(); notificar(`${cambiados.length} umbral(es) actualizados.`);
    } catch (e) { notificar(e.message, 'error'); }
  };

  const PESTANAS = [
    ['todos', 'Todo', Package], ['herramientas', 'Herramientas', Wrench], ['consumibles', 'Consumibles', FlaskConical],
    ['alertas', `Alertas (${alertas.length})`, AlertTriangle], ['prestamos', `Préstamos (${prestamosActivos.length})`, Handshake],
    ['movimientos', 'Movimientos', History], ...(admin ? [['umbrales', 'Umbrales', SlidersHorizontal]] : []),
  ];

  if (cargando) return <div className="p-12 text-center text-slate-400">Cargando inventario...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-emerald-600" /> Control de Inventario</h1>
          <p className="text-slate-500 text-sm mt-1">Herramientas en préstamo y consumibles con alertas de stock.</p>
        </div>
        <button onClick={() => setModalArticulo(ARTICULO_VACIO)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm self-start">
          <Plus size={18} /> Nuevo artículo
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            ['Herramientas', resumen.herramientas, Wrench, 'text-slate-700'],
            ['Consumibles', resumen.consumibles, FlaskConical, 'text-slate-700'],
            ['Stock crítico', resumen.criticos, AlertOctagon, 'text-red-600'],
            ['Stock insuficiente', resumen.bajos, AlertTriangle, 'text-amber-600'],
            ['Préstamos activos', resumen.prestamosActivos, Handshake, 'text-sky-600'],
          ].map(([label, valor, Icon, color]) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <Icon size={18} className={color} />
              <p className={`text-2xl font-bold mt-2 ${color}`}>{valor}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {alertas.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-amber-50 p-4">
          <p className="font-semibold text-red-700 text-sm flex items-center gap-2"><AlertTriangle size={16} /> {alertas.length} artículo(s) requieren reabastecimiento</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {alertas.map(i => (
              <button key={i.idInventario} onClick={() => setModalMovimiento({ item: i, tipoMovimiento: 'Entrada' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white hover:shadow-sm transition ${i.nivel === 'critico' ? 'border-red-300 text-red-700' : 'border-amber-300 text-amber-700'}`}>
                {i.nivel === 'critico' ? '🔴' : '🟡'} {i.nombre}: {i.cantidadActual} {i.unidad} <span className="opacity-60">· reabastecer</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PESTANAS.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setPestana(id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition ${pestana === id ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        {['todos', 'herramientas', 'consumibles', 'alertas'].includes(pestana) && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar artículo"
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-full lg:w-64 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {['todos', 'herramientas', 'consumibles', 'alertas'].includes(pestana) && (
          visibles.length === 0 ? <p className="p-12 text-center text-slate-400 text-sm">No hay artículos en esta vista.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Artículo</th><th className="py-3 px-5">Tipo</th><th className="py-3 px-5 w-56">Stock</th>
                    <th className="py-3 px-5">Nivel</th><th className="py-3 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibles.map(i => (
                    <tr key={i.idInventario} className={`${NIVEL[i.nivel].fila} hover:bg-slate-50/80`}>
                      <td className="py-3 px-5">
                        <p className="font-semibold text-slate-800">{i.nombre}</p>
                        <p className="text-xs text-slate-500">{i.categoria}{i.ubicacion ? ` · ${i.ubicacion}` : ''}</p>
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          {i.tipo === 'Herramienta' ? <Wrench size={13} /> : <FlaskConical size={13} />} {i.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="font-bold text-slate-800">{i.cantidadActual} <span className="text-xs font-normal text-slate-500">{i.unidad}</span></span>
                          <span className="text-[11px] text-slate-400">mín {i.stockMinimo} · crít {i.stockCritico}</span>
                        </div>
                        <BarraStock item={i} />
                        {i.prestados > 0 && <p className="text-[11px] text-sky-600 mt-1">{i.prestados} en préstamo</p>}
                      </td>
                      <td className="py-3 px-5"><NivelChip nivel={i.nivel} /></td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <button onClick={() => setModalMovimiento({ item: i, tipoMovimiento: 'Entrada' })} title="Entrada de stock" className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"><ArrowDownToLine size={16} /></button>
                        {i.tipo === 'Herramienta' ? (
                          <button onClick={() => setModalMovimiento({ item: i, tipoMovimiento: 'Prestamo' })} disabled={i.cantidadActual === 0} title="Prestar" className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 disabled:opacity-30"><Handshake size={16} /></button>
                        ) : (
                          <button onClick={() => setModalMovimiento({ item: i, tipoMovimiento: 'Salida' })} disabled={i.cantidadActual === 0} title="Registrar consumo" className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-30"><Minus size={16} /></button>
                        )}
                        <button onClick={() => setModalArticulo(i)} title="Editar" className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><Pencil size={16} /></button>
                        {admin && <button onClick={() => darDeBaja(i)} title="Dar de baja" className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {pestana === 'prestamos' && (
          prestamosActivos.length === 0 ? <p className="p-12 text-center text-slate-400 text-sm">No hay herramientas prestadas.</p> : (
            <ul className="divide-y divide-slate-100">
              {prestamosActivos.map(m => (
                <li key={m.idMovimiento} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm flex items-center gap-2"><Wrench size={14} className="text-sky-600" /> {m.inventario.nombre} × {m.cantidad}</p>
                    <p className="text-xs text-slate-500">Prestado a <strong>{m.empleado.nombreCompleto}</strong> el {formatoFecha(m.fecha)}{m.motivo ? ` · ${m.motivo}` : ''}</p>
                  </div>
                  <button onClick={() => devolver(m)} className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"><Undo2 size={14} /> Registrar devolución</button>
                </li>
              ))}
            </ul>
          )
        )}

        {pestana === 'movimientos' && (
          movimientos.length === 0 ? <p className="p-12 text-center text-slate-400 text-sm">Aún no hay movimientos.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Fecha</th><th className="py-3 px-5">Movimiento</th><th className="py-3 px-5">Artículo</th>
                    <th className="py-3 px-5">Cantidad</th><th className="py-3 px-5">Empleado</th><th className="py-3 px-5">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movimientos.map(m => {
                    const entra = m.tipoMovimiento === 'Entrada' || m.tipoMovimiento === 'Devolucion';
                    return (
                      <tr key={m.idMovimiento}>
                        <td className="py-2.5 px-5 text-slate-500">{formatoFecha(m.fecha)}</td>
                        <td className="py-2.5 px-5">
                          <span className={`text-xs font-semibold ${entra ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {{ Prestamo: 'Préstamo', Devolucion: 'Devolución', Salida: 'Consumo' }[m.tipoMovimiento] || m.tipoMovimiento}
                          </span>
                          {m.estadoPrestamo && <span className="ml-2 text-[11px] text-slate-400">({m.estadoPrestamo})</span>}
                        </td>
                        <td className="py-2.5 px-5 font-medium text-slate-700">{m.inventario.nombre}</td>
                        <td className={`py-2.5 px-5 font-semibold ${entra ? 'text-emerald-600' : 'text-amber-600'}`}>{entra ? '+' : '−'}{m.cantidad} {m.inventario.unidad}</td>
                        <td className="py-2.5 px-5 text-slate-600">{m.empleado.nombreCompleto}</td>
                        <td className="py-2.5 px-5 text-slate-500 text-xs">{m.motivo || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {pestana === 'umbrales' && admin && (
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-slate-600">
                Define cuándo se alerta cada artículo: <span className="text-amber-600 font-semibold">amarillo</span> al llegar al mínimo y <span className="text-red-600 font-semibold">rojo</span> al llegar al crítico.
              </p>
              <button onClick={guardarUmbrales} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5"><Save size={15} /> Guardar umbrales</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2 pr-4">Artículo</th><th className="py-2 pr-4">Actual</th><th className="py-2 pr-4 text-amber-600">Stock mínimo</th><th className="py-2 pr-4 text-red-600">Stock crítico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(i => {
                    const u = umbrales[i.idInventario] || {};
                    const invalido = Number(u.stockCritico) > Number(u.stockMinimo);
                    return (
                      <tr key={i.idInventario}>
                        <td className="py-2 pr-4 font-medium text-slate-700">{i.nombre} <span className="text-xs text-slate-400">({i.tipo})</span></td>
                        <td className="py-2 pr-4 text-slate-500">{i.cantidadActual} {i.unidad}</td>
                        {['stockMinimo', 'stockCritico'].map(campo => (
                          <td key={campo} className="py-2 pr-4">
                            <input type="number" min="0" value={u[campo] ?? ''}
                              onChange={e => setUmbrales({ ...umbrales, [i.idInventario]: { ...u, [campo]: e.target.value } })}
                              className={`w-24 px-2.5 py-1.5 rounded-lg border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${invalido ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!modalArticulo} onClose={() => setModalArticulo(null)} title={modalArticulo?.idInventario ? 'Editar artículo' : 'Nuevo artículo'}>
        {modalArticulo && <ArticuloForm inicial={modalArticulo} onSubmit={guardarArticulo} onCancel={() => setModalArticulo(null)} />}
      </Modal>
      <Modal open={!!modalMovimiento} onClose={() => setModalMovimiento(null)} title="Movimiento de inventario">
        {modalMovimiento && (
          <MovimientoForm item={modalMovimiento.item} tipoMovimiento={modalMovimiento.tipoMovimiento} empleados={empleados}
            usuario={usuario} onSubmit={registrarMovimiento} onCancel={() => setModalMovimiento(null)} />
        )}
      </Modal>
    </div>
  );
}
