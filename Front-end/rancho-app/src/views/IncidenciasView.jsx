// IncidenciasView.jsx — Centro de reportes internos: envío rápido (empleados) y panel de atención (admin) (Tarjeta 5)
import { useCallback, useEffect, useState } from 'react';
import {
  Siren, Beef, Truck, Megaphone, Camera, X, Send, ClipboardList, CheckCircle2, Eye, Trash2, Plus,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { api, esAdmin, formatoFechaHora, tiempoRelativo } from '../utils/http';

const TIPOS = [
  { id: 'Animal lesionado', icon: Beef, cls: 'border-rose-200 bg-rose-50 text-rose-700', activo: 'ring-rose-500' },
  { id: 'Daño en vehículo/maquinaria', icon: Truck, cls: 'border-orange-200 bg-orange-50 text-orange-700', activo: 'ring-orange-500' },
  { id: 'Aviso general', icon: Megaphone, cls: 'border-sky-200 bg-sky-50 text-sky-700', activo: 'ring-sky-500' },
];
const ESTADO_CLS = {
  Pendiente: 'bg-red-100 text-red-700', 'En revisión': 'bg-amber-100 text-amber-700',
  Atendido: 'bg-emerald-100 text-emerald-700', Descartado: 'bg-slate-100 text-slate-500',
};
const PRIORIDAD_CLS = { Alta: 'text-red-600', Media: 'text-amber-600', Baja: 'text-slate-500' };
const inputCls = 'w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white';

// Reduce la foto en el navegador (máx. 1280 px, JPEG) para que pese poco al enviarla
const comprimirFoto = (archivo) => new Promise((resolve, reject) => {
  const lector = new FileReader();
  lector.onerror = reject;
  lector.onload = () => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const escala = Math.min(1, 1280 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.src = lector.result;
  };
  lector.readAsDataURL(archivo);
});

function FormularioReporte({ catalogos, usuario, onEnviado, notificar }) {
  const vacio = { tipoIncidencia: '', titulo: '', descripcion: '', prioridad: 'Media', idAnimalAfectado: '', idEquipoAfectado: '', fotoUrl: '' };
  const [form, setForm] = useState(vacio);
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const elegirFoto = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    try { setForm(f => ({ ...f, fotoUrl: '' })); const fotoUrl = await comprimirFoto(archivo); setForm(f => ({ ...f, fotoUrl })); }
    catch { notificar('No se pudo leer la imagen.', 'error'); }
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!form.tipoIncidencia) return notificar('Elige el tipo de reporte.', 'error');
    if (!usuario?.idEmpleado) return notificar('Vuelve a iniciar sesión para identificar al empleado.', 'error');
    setEnviando(true);
    try {
      const r = await api('/api/incidencias', { method: 'POST', body: { ...form, idEmpleado: usuario.idEmpleado } });
      setForm(vacio); notificar(r.message); onEnviado?.();
    } catch (err) { notificar(err.message, 'error'); }
    finally { setEnviando(false); }
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TIPOS.map(({ id, icon: Icon, cls, activo }) => (
          <button type="button" key={id} onClick={() => setForm({ ...form, tipoIncidencia: id })}
            className={`p-4 rounded-2xl border-2 flex sm:flex-col items-center gap-3 sm:gap-2 text-sm font-semibold transition ${cls} ${form.tipoIncidencia === id ? `ring-2 ring-offset-1 ${activo}` : 'opacity-80 hover:opacity-100'}`}>
            <Icon size={26} /> <span className="text-left sm:text-center">{id}</span>
          </button>
        ))}
      </div>

      {form.tipoIncidencia === 'Animal lesionado' && (
        <select value={form.idAnimalAfectado} onChange={set('idAnimalAfectado')} className={inputCls}>
          <option value="">¿Qué animal? (opcional)</option>
          {catalogos.animales.map(a => <option key={a.idAnimal} value={a.idAnimal}>{a.areteBandera}{a.nombre ? ` — ${a.nombre}` : ''}</option>)}
        </select>
      )}
      {form.tipoIncidencia === 'Daño en vehículo/maquinaria' && (
        <select value={form.idEquipoAfectado} onChange={set('idEquipoAfectado')} className={inputCls}>
          <option value="">¿Qué vehículo o máquina? (opcional)</option>
          {catalogos.equipos.map(e => <option key={e.idEquipo} value={e.idEquipo}>{e.nombre} ({e.categoria})</option>)}
        </select>
      )}

      <input value={form.titulo} onChange={set('titulo')} maxLength={100} placeholder="Título corto (ej. Vaca cojeando en corral 2)" className={inputCls} />
      <textarea required rows={4} value={form.descripcion} onChange={set('descripcion')} placeholder="¿Qué pasó? ¿Dónde? ¿Desde cuándo?" className={inputCls} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-semibold">
          {['Baja', 'Media', 'Alta'].map(p => (
            <button type="button" key={p} onClick={() => setForm({ ...form, prioridad: p })}
              className={`px-4 py-2.5 ${form.prioridad === p ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}>{p}</button>
          ))}
        </div>
        <label className="px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 inline-flex items-center gap-2">
          <Camera size={17} /> {form.fotoUrl ? 'Cambiar foto' : 'Agregar foto'}
          <input type="file" accept="image/*" capture="environment" onChange={elegirFoto} className="hidden" />
        </label>
        {form.fotoUrl && (
          <div className="relative">
            <img src={form.fotoUrl} alt="Vista previa" className="h-14 w-14 rounded-lg object-cover border border-slate-200" />
            <button type="button" onClick={() => setForm({ ...form, fotoUrl: '' })} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center"><X size={12} /></button>
          </div>
        )}
      </div>

      <button type="submit" disabled={enviando} className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold inline-flex items-center justify-center gap-2">
        <Send size={17} /> {enviando ? 'Enviando…' : 'Enviar reporte'}
      </button>
    </form>
  );
}

function TarjetaIncidencia({ r, onAbrir, admin }) {
  const tipo = TIPOS.find(t => t.id === r.tipoIncidencia) || TIPOS[2];
  const Icon = tipo.icon;
  return (
    <button onClick={() => onAbrir(r)} className="w-full text-left p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition flex gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${tipo.cls}`}><Icon size={20} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-800 truncate">{r.titulo}</p>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ESTADO_CLS[r.estado]}`}>{r.estado}</span>
          <span className={`text-[11px] font-semibold ${PRIORIDAD_CLS[r.prioridad]}`}>● {r.prioridad}</span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{r.descripcion}</p>
        <p className="text-xs text-slate-400 mt-1">
          {admin && <>{r.empleado?.nombreCompleto} · </>}{tiempoRelativo(r.fecha)}
          {r.animal && ` · 🐄 ${r.animal.areteBandera}`}{r.equipo && ` · 🚜 ${r.equipo.nombre}`}
        </p>
      </div>
      {r.fotoUrl && <img src={r.fotoUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 hidden sm:block" />}
    </button>
  );
}

export default function IncidenciasView({ showToast, usuario }) {
  const admin = esAdmin(usuario);
  const idUsuario = usuario?.idEmpleado;
  const [catalogos, setCatalogos] = useState({ animales: [], equipos: [] });
  const [incidencias, setIncidencias] = useState([]);
  const [resumen, setResumen] = useState({});
  const [modo, setModo] = useState(admin ? 'panel' : 'reportar');
  const [filtros, setFiltros] = useState({ estado: admin ? 'Pendiente' : '', tipo: '' });
  const [seleccionada, setSeleccionada] = useState(null);
  const [atencion, setAtencion] = useState({ estado: '', respuesta: '' });
  const [nuevoEquipo, setNuevoEquipo] = useState('');

  const notificar = useCallback((message, type = 'success') => (showToast ? showToast({ message, type }) : alert(message)), [showToast]);

  const cargar = useCallback(async () => {
    try {
      const [cat, lista, res] = await Promise.all([
        api('/api/incidencias/catalogos'),
        api('/api/incidencias', { query: { ...filtros, idEmpleado: admin ? undefined : idUsuario } }),
        api('/api/incidencias/resumen'),
      ]);
      setCatalogos(cat); setIncidencias(lista); setResumen(res);
    } catch (e) { notificar(e.message, 'error'); }
  }, [filtros, admin, idUsuario, notificar]);

  useEffect(() => { const t = setTimeout(cargar, 0); return () => clearTimeout(t); }, [cargar]);

  const abrir = (r) => { setSeleccionada(r); setAtencion({ estado: r.estado, respuesta: r.respuesta || '' }); };

  const guardarAtencion = async () => {
    try {
      await api(`/api/incidencias/${seleccionada.idReporte}`, { method: 'PATCH', body: { ...atencion, atendidoPor: usuario?.nombre } });
      setSeleccionada(null); await cargar(); notificar('Incidencia actualizada.');
    } catch (e) { notificar(e.message, 'error'); }
  };

  const eliminar = async () => {
    if (!confirm('¿Eliminar este reporte definitivamente?')) return;
    try { await api(`/api/incidencias/${seleccionada.idReporte}`, { method: 'DELETE' }); setSeleccionada(null); await cargar(); }
    catch (e) { notificar(e.message, 'error'); }
  };

  const agregarEquipo = async (e) => {
    e.preventDefault();
    try { await api('/api/incidencias/equipos', { method: 'POST', body: { nombre: nuevoEquipo } }); setNuevoEquipo(''); await cargar(); notificar('Equipo agregado.'); }
    catch (err) { notificar(err.message, 'error'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Siren className="text-emerald-600" /> Reportes e Incidencias</h1>
          <p className="text-slate-500 text-sm mt-1">{admin ? 'Revisa y atiende lo que reporta el personal.' : 'Avisa rápido de cualquier novedad en el rancho.'}</p>
        </div>
        <div className="flex rounded-xl bg-white border border-slate-200 p-1 text-sm font-semibold self-start">
          <button onClick={() => setModo('reportar')} className={`px-4 py-2 rounded-lg inline-flex items-center gap-1.5 ${modo === 'reportar' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}><Plus size={15} /> Reportar</button>
          <button onClick={() => setModo('panel')} className={`px-4 py-2 rounded-lg inline-flex items-center gap-1.5 ${modo === 'panel' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>
            <ClipboardList size={15} /> {admin ? 'Panel' : 'Mis reportes'}
            {admin && resumen.Pendiente > 0 && <span className="ml-1 px-1.5 rounded-full bg-red-500 text-white text-[11px]">{resumen.Pendiente}</span>}
          </button>
        </div>
      </div>

      {modo === 'reportar' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-8">
          <FormularioReporte catalogos={catalogos} usuario={usuario} notificar={notificar} onEnviado={() => { cargar(); setModo('panel'); }} />
        </div>
      )}

      {modo === 'panel' && (
        <>
          {admin && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.keys(ESTADO_CLS).map(est => (
                <button key={est} onClick={() => setFiltros({ ...filtros, estado: filtros.estado === est ? '' : est })}
                  className={`p-4 rounded-2xl border text-left transition ${filtros.estado === est ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'} shadow-sm`}>
                  <p className="text-2xl font-bold text-slate-800">{resumen[est] || 0}</p>
                  <p className="text-xs text-slate-500">{est}</p>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <select value={filtros.tipo} onChange={e => setFiltros({ ...filtros, tipo: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
              <option value="">Todos los tipos</option>{TIPOS.map(t => <option key={t.id}>{t.id}</option>)}
            </select>
            <select value={filtros.estado} onChange={e => setFiltros({ ...filtros, estado: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
              <option value="">Todos los estados</option>{Object.keys(ESTADO_CLS).map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          {incidencias.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
              <CheckCircle2 className="mx-auto mb-2 text-emerald-400" /> No hay reportes en esta vista.
            </div>
          ) : (
            <div className="space-y-2.5">{incidencias.map(r => <TarjetaIncidencia key={r.idReporte} r={r} onAbrir={abrir} admin={admin} />)}</div>
          )}
          {admin && (
            <form onSubmit={agregarEquipo} className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              Vehículos y maquinaria registrados: {catalogos.equipos.map(e => e.nombre).join(', ') || 'ninguno'}.
              <input value={nuevoEquipo} onChange={e => setNuevoEquipo(e.target.value)} required placeholder="Agregar equipo" className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm" />
              <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold">Agregar</button>
            </form>
          )}
        </>
      )}

      <Modal open={!!seleccionada} onClose={() => setSeleccionada(null)} title={seleccionada?.titulo} maxWidth="max-w-2xl">
        {seleccionada && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_CLS[seleccionada.estado]}`}>{seleccionada.estado}</span>
              <span className="text-xs text-slate-500">{seleccionada.tipoIncidencia} · prioridad <strong className={PRIORIDAD_CLS[seleccionada.prioridad]}>{seleccionada.prioridad}</strong></span>
            </div>
            <p className="text-slate-700 whitespace-pre-line">{seleccionada.descripcion}</p>
            <p className="text-xs text-slate-400">
              Reportado por {seleccionada.empleado?.nombreCompleto} el {formatoFechaHora(seleccionada.fecha)}
              {seleccionada.animal && ` · Animal: ${seleccionada.animal.areteBandera}`}{seleccionada.equipo && ` · Equipo: ${seleccionada.equipo.nombre}`}
            </p>
            {seleccionada.fotoUrl && (
              <a href={seleccionada.fotoUrl} target="_blank" rel="noreferrer" className="block">
                <img src={seleccionada.fotoUrl} alt="Foto del reporte" className="max-h-80 rounded-xl border border-slate-200 mx-auto" />
              </a>
            )}
            {seleccionada.respuesta && !admin && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 mb-1">Respuesta de {seleccionada.atendidoPor || 'administración'}</p>
                <p className="text-slate-700">{seleccionada.respuesta}</p>
              </div>
            )}
            {admin && (
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5"><Eye size={13} /> Atención</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(ESTADO_CLS).map(est => (
                    <button key={est} onClick={() => setAtencion({ ...atencion, estado: est })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${atencion.estado === est ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>{est}</button>
                  ))}
                </div>
                <textarea rows={3} value={atencion.respuesta} onChange={e => setAtencion({ ...atencion, respuesta: e.target.value })}
                  placeholder="Acciones tomadas o respuesta para el empleado" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                {seleccionada.fechaAtencion && <p className="text-xs text-slate-400">Atendido por {seleccionada.atendidoPor} el {formatoFechaHora(seleccionada.fechaAtencion)}</p>}
                <div className="flex justify-between">
                  <button onClick={eliminar} className="px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"><Trash2 size={15} /> Eliminar</button>
                  <button onClick={guardarAtencion} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">Guardar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
