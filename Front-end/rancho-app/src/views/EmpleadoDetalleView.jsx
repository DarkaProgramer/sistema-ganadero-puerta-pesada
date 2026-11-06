// EmpleadoDetalleView.jsx — Ficha a detalle / expediente del empleado (Tarjeta 1)
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft, Mail, Phone, Briefcase, Shield, User, CalendarDays, MapPin, HeartPulse, Fence, Plus, X,
  Syringe, Package, AlertTriangle, DollarSign, Clock, Save, FileText,
} from 'lucide-react';
import { api, formatoFecha } from '../utils/http';
import { ESTATUS } from '../utils/estatusEmpleado';
import EstatusBadge from '../components/ui/EstatusBadge';

const ICONO_ACTIVIDAD = {
  Salud: { icon: Syringe, classes: 'bg-teal-50 text-teal-600' },
  Inventario: { icon: Package, classes: 'bg-sky-50 text-sky-600' },
  Incidencia: { icon: AlertTriangle, classes: 'bg-red-50 text-red-600' },
  Agenda: { icon: CalendarDays, classes: 'bg-violet-50 text-violet-600' },
  'Transacción': { icon: DollarSign, classes: 'bg-emerald-50 text-emerald-600' },
};

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white';

export default function EmpleadoDetalleView({ idEmpleado, onBack, onEditar, showToast }) {
  const [datos, setDatos] = useState(null);
  const [corrales, setCorrales] = useState([]);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [nuevaAsignacion, setNuevaAsignacion] = useState({ idCorral: '', responsabilidad: '' });
  const [filtroActividad, setFiltroActividad] = useState('Todas');

  const notificar = (message, type = 'success') => (showToast ? showToast({ message, type }) : alert(message));

  const cargar = useCallback(async () => {
    try {
      const [exp, listaCorrales] = await Promise.all([
        api(`/api/empleados/${idEmpleado}/expediente`),
        api('/api/configuracion/corrales'),
      ]);
      setDatos(exp);
      setCorrales(listaCorrales);
      setForm({
        estatus: exp.empleado.estatus,
        fechaContratacion: exp.empleado.fechaContratacion?.slice(0, 10) || '',
        direccion: exp.empleado.direccion || '',
        contactoEmergencia: exp.empleado.contactoEmergencia || '',
        notas: exp.empleado.notas || '',
      });
    } catch (e) {
      setError(e.message);
    }
  }, [idEmpleado]);

  useEffect(() => { const t = setTimeout(cargar, 0); return () => clearTimeout(t); }, [cargar]);

  const guardarExpediente = async (e) => {
    e.preventDefault();
    try {
      await api(`/api/empleados/${idEmpleado}/expediente`, { method: 'PUT', body: form });
      setEditando(false);
      await cargar();
      notificar('Expediente actualizado.');
    } catch (err) { notificar(err.message, 'error'); }
  };

  const cambiarEstatus = async (estatus) => {
    try {
      await api(`/api/empleados/${idEmpleado}/estatus`, { method: 'PATCH', body: { estatus } });
      await cargar();
      notificar(`Estatus cambiado a ${estatus}.`);
    } catch (err) { notificar(err.message, 'error'); }
  };

  const asignar = async (e) => {
    e.preventDefault();
    try {
      await api(`/api/empleados/${idEmpleado}/corrales`, { method: 'POST', body: nuevaAsignacion });
      setNuevaAsignacion({ idCorral: '', responsabilidad: '' });
      await cargar();
      notificar('Corral asignado.');
    } catch (err) { notificar(err.message, 'error'); }
  };

  const quitar = async (idCorral) => {
    if (!confirm('¿Quitar esta responsabilidad?')) return;
    try {
      await api(`/api/empleados/${idEmpleado}/corrales/${idCorral}`, { method: 'DELETE' });
      await cargar();
    } catch (err) { notificar(err.message, 'error'); }
  };

  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
  if (!datos) return <div className="p-12 text-center text-slate-400">Cargando expediente...</div>;

  const { empleado, actividades, estadisticas } = datos;
  const esAdminEmp = empleado.rol === 'Administrador';
  const iniciales = empleado.nombreCompleto.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const asignados = new Set(empleado.asignacionesCorral.map(a => a.idCorral));
  const tiposActividad = ['Todas', ...new Set(actividades.map(a => a.tipo))];
  const actividadesFiltradas = filtroActividad === 'Todas' ? actividades : actividades.filter(a => a.tipo === filtroActividad);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition">
        <ArrowLeft size={18} /> Volver a empleados
      </button>

      {/* Cabecera */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-sm">{iniciales}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{empleado.nombreCompleto}</h1>
              <EstatusBadge estatus={empleado.estatus} />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Briefcase size={14} /> {empleado.puestoRelacion?.nombre || 'Sin puesto'}</span>
              <span className="inline-flex items-center gap-1.5">{esAdminEmp ? <Shield size={14} /> : <User size={14} />} {empleado.rol}</span>
              {empleado.fechaContratacion && (
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Desde {formatoFecha(empleado.fechaContratacion)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={empleado.estatus} onChange={e => cambiarEstatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            {Object.keys(ESTATUS).map(s => <option key={s} value={s}>Estatus: {s}</option>)}
          </select>
          {onEditar && (
            <button onClick={() => onEditar(empleado)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Editar datos de acceso
            </button>
          )}
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          ['Corrales a cargo', estadisticas.corralesAsignados, Fence, 'text-emerald-600'],
          ['Controles sanitarios', estadisticas.controlesSanitarios, Syringe, 'text-teal-600'],
          ['Movimientos inventario', estadisticas.movimientosInventario, Package, 'text-sky-600'],
          ['Préstamos activos', estadisticas.prestamosActivos, Clock, 'text-amber-600'],
          ['Incidencias reportadas', estadisticas.incidenciasReportadas, AlertTriangle, 'text-red-600'],
        ].map(([label, valor, Icon, color]) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <Icon size={18} className={color} />
            <p className="text-2xl font-bold text-slate-800 mt-2">{valor}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna izquierda: contacto + corrales */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Datos de contacto</h2>
              {!editando && <button onClick={() => setEditando(true)} className="text-xs font-semibold text-emerald-600 hover:underline">Editar</button>}
            </div>
            {editando ? (
              <form onSubmit={guardarExpediente} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Fecha de contratación
                  <input type="date" value={form.fechaContratacion} onChange={e => setForm({ ...form, fechaContratacion: e.target.value })} className={`${inputCls} mt-1`} />
                </label>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Dirección
                  <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className={`${inputCls} mt-1`} placeholder="Calle, número, localidad" />
                </label>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Contacto de emergencia
                  <input value={form.contactoEmergencia} onChange={e => setForm({ ...form, contactoEmergencia: e.target.value })} className={`${inputCls} mt-1`} placeholder="Nombre — teléfono" />
                </label>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Notas internas
                  <textarea rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} className={`${inputCls} mt-1`} />
                </label>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setEditando(false)} className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">Cancelar</button>
                  <button type="submit" className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1.5"><Save size={14} /> Guardar</button>
                </div>
              </form>
            ) : (
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5"><Mail size={16} className="text-slate-400 mt-0.5" /> {empleado.correo}</li>
                <li className="flex items-start gap-2.5"><Phone size={16} className="text-slate-400 mt-0.5" /> {empleado.telefono || 'Sin teléfono'}</li>
                <li className="flex items-start gap-2.5"><MapPin size={16} className="text-slate-400 mt-0.5" /> {empleado.direccion || 'Sin dirección registrada'}</li>
                <li className="flex items-start gap-2.5"><HeartPulse size={16} className="text-slate-400 mt-0.5" /> {empleado.contactoEmergencia || 'Sin contacto de emergencia'}</li>
                {empleado.notas && <li className="flex items-start gap-2.5"><FileText size={16} className="text-slate-400 mt-0.5" /> <span className="whitespace-pre-line">{empleado.notas}</span></li>}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Corrales asignados y responsabilidades</h2>
            {empleado.asignacionesCorral.length === 0 ? (
              <p className="text-sm text-slate-400 mb-4">Aún no tiene corrales a su cargo.</p>
            ) : (
              <ul className="space-y-2 mb-4">
                {empleado.asignacionesCorral.map(a => (
                  <li key={a.idAsignacion} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Fence size={14} className="text-emerald-600" /> {a.corral.nombre}</p>
                      <p className="text-xs text-slate-500">{a.responsabilidad || 'Responsable general'} · desde {formatoFecha(a.fechaAsignacion)}</p>
                    </div>
                    <button onClick={() => quitar(a.idCorral)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Quitar"><X size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={asignar} className="space-y-2">
              <select required value={nuevaAsignacion.idCorral} onChange={e => setNuevaAsignacion({ ...nuevaAsignacion, idCorral: e.target.value })} className={inputCls}>
                <option value="">Asignar corral…</option>
                {corrales.filter(c => !asignados.has(c.idCorral)).map(c => <option key={c.idCorral} value={c.idCorral}>{c.nombre}</option>)}
              </select>
              <input value={nuevaAsignacion.responsabilidad} onChange={e => setNuevaAsignacion({ ...nuevaAsignacion, responsabilidad: e.target.value })}
                placeholder="Responsabilidad (ej. alimentación, limpieza)" className={inputCls} />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                <Plus size={15} /> Asignar
              </button>
            </form>
          </div>
        </div>

        {/* Historial de actividades */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="font-semibold text-slate-800">Historial de actividades</h2>
            <div className="flex flex-wrap gap-1.5">
              {tiposActividad.map(t => (
                <button key={t} onClick={() => setFiltroActividad(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filtroActividad === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {actividadesFiltradas.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-12">Sin actividades registradas.</p>
          ) : (
            <ol className="relative border-l border-slate-100 ml-3 space-y-5">
              {actividadesFiltradas.map((a, i) => {
                const cfg = ICONO_ACTIVIDAD[a.tipo] || ICONO_ACTIVIDAD.Agenda;
                const Icon = cfg.icon;
                return (
                  <li key={i} className="ml-6">
                    <span className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white ${cfg.classes}`}><Icon size={13} /></span>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-700">{a.titulo}</p>
                      <time className="text-xs text-slate-400">{formatoFecha(a.fecha)}</time>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{a.tipo} · {a.detalle}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
