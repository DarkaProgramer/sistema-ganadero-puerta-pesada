// forms/TransaccionForm.jsx — Registro de venta o compra con reglas de negocio (Tarjeta 3)
import { useMemo, useState } from 'react';
import { Beef, Package, FileText, Trash2, UserPlus } from 'lucide-react';
import { formatoMoneda, hoyISO } from '../../utils/http';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white';
let siguienteId = 1;

export default function TransaccionForm({ tipo, catalogos, moneda, onSubmit, onCancel }) {
  const esVenta = tipo === 'Venta';
  const [form, setForm] = useState({ fecha: hoyISO(), estado: 'Pagado', metodoPago: 'Efectivo', notas: '', idContraparte: '' });
  const [nuevaContraparte, setNuevaContraparte] = useState(null); // { nombre, telefono, correo }
  const [lineas, setLineas] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const contrapartes = esVenta
    ? catalogos.clientes.map(c => ({ id: c.idClient, nombre: c.nomCliente }))
    : catalogos.proveedores.map(p => ({ id: p.idProveedor, nombre: p.nombre }));

  const agregar = (concepto) => setLineas(ls => [...ls, {
    key: siguienteId++, concepto, precioUnitario: '', cantidad: 1, idAnimal: '', idInventario: '', descripcion: '',
    nuevoAnimal: { areteBandera: '', nombre: '', genero: 'Hembra', idTipoAnimal: '', idRaza: '', idCorral: '', fechaNacimiento: '' },
  }]);
  const actualizar = (key, cambios) => setLineas(ls => ls.map(l => (l.key === key ? { ...l, ...cambios } : l)));
  const actualizarAnimal = (key, cambios) => setLineas(ls => ls.map(l => (l.key === key ? { ...l, nuevoAnimal: { ...l.nuevoAnimal, ...cambios } } : l)));
  const quitar = (key) => setLineas(ls => ls.filter(l => l.key !== key));

  const animalesElegidos = new Set(lineas.filter(l => l.concepto === 'Animal').map(l => String(l.idAnimal)));
  const total = useMemo(() => lineas.reduce((s, l) => s + (Number(l.cantidad) || 0) * (Number(l.precioUnitario) || 0), 0), [lineas]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!lineas.length) return alert('Agrega al menos un concepto.');
    const cuerpo = {
      tipo, fecha: form.fecha, estado: form.estado, metodoPago: form.metodoPago, notas: form.notas,
      detalles: lineas.map(l => {
        const base = { concepto: l.concepto, precioUnitario: Number(l.precioUnitario) };
        if (l.concepto === 'Animal') return esVenta ? { ...base, idAnimal: Number(l.idAnimal) } : { ...base, nuevoAnimal: l.nuevoAnimal };
        if (l.concepto === 'Otro') return { ...base, descripcion: l.descripcion, cantidad: Number(l.cantidad) };
        const item = catalogos.inventario.find(i => String(i.idInventario) === String(l.idInventario));
        return { ...base, concepto: item?.tipo === 'Herramienta' ? 'Herramienta' : 'Insumo', idInventario: Number(l.idInventario), cantidad: Number(l.cantidad) };
      }),
    };
    if (nuevaContraparte?.nombre) {
      cuerpo[esVenta ? 'nuevoCliente' : 'nuevoProveedor'] = esVenta
        ? { nomCliente: nuevaContraparte.nombre, telefono: nuevaContraparte.telefono, correo: nuevaContraparte.correo }
        : nuevaContraparte;
    } else cuerpo[esVenta ? 'idCliente' : 'idProveedor'] = form.idContraparte;
    setEnviando(true);
    try { await onSubmit(cuerpo); } finally { setEnviando(false); }
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      {/* Contraparte y datos generales */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">{esVenta ? 'Cliente' : 'Proveedor'}</label>
            <button type="button" onClick={() => setNuevaContraparte(nuevaContraparte ? null : { nombre: '', telefono: '', correo: '' })}
              className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1"><UserPlus size={13} /> {nuevaContraparte ? 'Elegir existente' : 'Registrar nuevo'}</button>
          </div>
          {nuevaContraparte ? (
            <div className="grid sm:grid-cols-3 gap-2">
              <input required value={nuevaContraparte.nombre} onChange={e => setNuevaContraparte({ ...nuevaContraparte, nombre: e.target.value })} placeholder="Nombre o razón social" className={inputCls} />
              <input value={nuevaContraparte.telefono} onChange={e => setNuevaContraparte({ ...nuevaContraparte, telefono: e.target.value })} placeholder="Teléfono" className={inputCls} />
              <input type="email" value={nuevaContraparte.correo} onChange={e => setNuevaContraparte({ ...nuevaContraparte, correo: e.target.value })} placeholder="Correo" className={inputCls} />
            </div>
          ) : (
            <select required value={form.idContraparte} onChange={e => setForm({ ...form, idContraparte: e.target.value })} className={inputCls}>
              <option value="">Selecciona…</option>
              {contrapartes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          )}
        </div>
        <label className="text-xs font-semibold text-slate-500 uppercase">Fecha
          <input type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className={`${inputCls} mt-1`} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Estado
            <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className={`${inputCls} mt-1`}>
              <option>Pagado</option><option>Pendiente</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500 uppercase">Pago
            <select value={form.metodoPago} onChange={e => setForm({ ...form, metodoPago: e.target.value })} className={`${inputCls} mt-1`}>
              <option>Efectivo</option><option>Transferencia</option><option>Cheque</option><option>Crédito</option>
            </select>
          </label>
        </div>
      </div>

      {/* Conceptos */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">Conceptos</p>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => agregar('Animal')} className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1"><Beef size={13} /> {esVenta ? 'Animal del hato' : 'Nuevo ejemplar'}</button>
            <button type="button" onClick={() => agregar('Inventario')} className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold inline-flex items-center gap-1"><Package size={13} /> Insumo / herramienta</button>
            <button type="button" onClick={() => agregar('Otro')} className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold inline-flex items-center gap-1"><FileText size={13} /> Otro</button>
          </div>
        </div>

        {lineas.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
            {esVenta ? 'Agrega los animales o productos a vender. Los animales pasarán a "Vendido" automáticamente.' : 'Agrega los ejemplares, insumos o herramientas comprados. Se darán de alta en el hato / inventario.'}
          </p>
        )}

        <div className="space-y-2">
          {lineas.map(l => (
            <div key={l.key} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 grid gap-2">
                  {l.concepto === 'Animal' && esVenta && (
                    <select required value={l.idAnimal} onChange={e => actualizar(l.key, { idAnimal: e.target.value })} className={inputCls}>
                      <option value="">Selecciona un animal vivo…</option>
                      {catalogos.animales.filter(a => !animalesElegidos.has(String(a.idAnimal)) || String(a.idAnimal) === String(l.idAnimal)).map(a => (
                        <option key={a.idAnimal} value={a.idAnimal}>{a.areteBandera}{a.nombre ? ` — ${a.nombre}` : ''} · {a.tipoAnimal?.nombre} {a.raza?.nombre} · {a.genero}</option>
                      ))}
                    </select>
                  )}
                  {l.concepto === 'Animal' && !esVenta && (() => {
                    const tipoSel = catalogos.tiposAnimal.find(t => String(t.idTipoAnimal) === String(l.nuevoAnimal.idTipoAnimal));
                    return (
                      <div className="grid sm:grid-cols-3 gap-2">
                        <input required value={l.nuevoAnimal.areteBandera} onChange={e => actualizarAnimal(l.key, { areteBandera: e.target.value })} placeholder="Arete bandera" className={inputCls} />
                        <input value={l.nuevoAnimal.nombre} onChange={e => actualizarAnimal(l.key, { nombre: e.target.value })} placeholder="Nombre (opcional)" className={inputCls} />
                        <select value={l.nuevoAnimal.genero} onChange={e => actualizarAnimal(l.key, { genero: e.target.value })} className={inputCls}><option>Hembra</option><option>Macho</option></select>
                        <select required value={l.nuevoAnimal.idTipoAnimal} onChange={e => actualizarAnimal(l.key, { idTipoAnimal: e.target.value, idRaza: '' })} className={inputCls}>
                          <option value="">Tipo…</option>{catalogos.tiposAnimal.map(t => <option key={t.idTipoAnimal} value={t.idTipoAnimal}>{t.nombre}</option>)}
                        </select>
                        <select required value={l.nuevoAnimal.idRaza} onChange={e => actualizarAnimal(l.key, { idRaza: e.target.value })} className={inputCls} disabled={!tipoSel}>
                          <option value="">Raza…</option>{tipoSel?.razas.map(r => <option key={r.idRaza} value={r.idRaza}>{r.nombre}</option>)}
                        </select>
                        <select required value={l.nuevoAnimal.idCorral} onChange={e => actualizarAnimal(l.key, { idCorral: e.target.value })} className={inputCls}>
                          <option value="">Corral destino…</option>
                          {catalogos.corrales.map(c => {
                            const lleno = c._count.animales >= c.capacidadMaxima;
                            return <option key={c.idCorral} value={c.idCorral} disabled={lleno}>{c.nombre} ({c._count.animales}/{c.capacidadMaxima}){lleno ? ' — lleno' : ''}</option>;
                          })}
                        </select>
                        <label className="sm:col-span-3 text-xs text-slate-500 flex items-center gap-2">Fecha de nacimiento (opcional, para calcular su etapa)
                          <input type="date" value={l.nuevoAnimal.fechaNacimiento} onChange={e => actualizarAnimal(l.key, { fechaNacimiento: e.target.value })} className="px-2 py-1 rounded-lg border border-slate-200 text-sm" />
                        </label>
                      </div>
                    );
                  })()}
                  {l.concepto === 'Inventario' && (
                    <select required value={l.idInventario} onChange={e => actualizar(l.key, { idInventario: e.target.value })} className={inputCls}>
                      <option value="">Selecciona un artículo…</option>
                      {catalogos.inventario.map(i => (
                        <option key={i.idInventario} value={i.idInventario}>{i.nombre} ({i.tipo}) · {i.cantidadActual} {i.unidad} disponibles</option>
                      ))}
                    </select>
                  )}
                  {l.concepto === 'Otro' && (
                    <input required value={l.descripcion} onChange={e => actualizar(l.key, { descripcion: e.target.value })} placeholder="Descripción (flete, servicio, etc.)" className={inputCls} />
                  )}
                </div>
                <button type="button" onClick={() => quitar(l.key)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end text-sm">
                {l.concepto !== 'Animal' && (
                  <label className="text-xs text-slate-500 flex items-center gap-1">Cant.
                    <input type="number" min="1" required value={l.cantidad} onChange={e => actualizar(l.key, { cantidad: e.target.value })} className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                  </label>
                )}
                <label className="text-xs text-slate-500 flex items-center gap-1">{l.concepto === 'Animal' ? 'Precio' : 'Precio unit.'}
                  <input type="number" min="0" step="0.01" required value={l.precioUnitario} onChange={e => actualizar(l.key, { precioUnitario: e.target.value })} placeholder="0.00" className="w-32 px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                </label>
                <span className="w-28 text-right font-semibold text-slate-700">{formatoMoneda((Number(l.cantidad) || 0) * (Number(l.precioUnitario) || 0), moneda)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <textarea rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas (condiciones, guía de tránsito, etc.)" className={inputCls} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <p className="text-lg font-bold text-slate-800">Total: <span className={esVenta ? 'text-emerald-600' : 'text-red-600'}>{formatoMoneda(total, moneda)}</span></p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={enviando} className={`px-4 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 ${esVenta ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'}`}>
            {enviando ? 'Guardando…' : `Registrar ${tipo.toLowerCase()}`}
          </button>
        </div>
      </div>
    </form>
  );
}
