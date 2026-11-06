// CalendarioView.jsx — Agenda inteligente con FullCalendar, eventos automáticos, repetibles y avisos por correo (Tarjeta 4)
import { useCallback, useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarDays, Plus, Mail, Repeat, Trash2, Send, Clock, User, Wallet } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { api, hoyISO } from '../utils/http';

const TIPOS = ['General', 'Vacunación', 'Pago', 'Mantenimiento', 'Venta', 'Cobro', 'Inventario', 'Reunión'];
const DIAS = [['1', 'L'], ['2', 'M'], ['3', 'Mi'], ['4', 'J'], ['5', 'V'], ['6', 'S'], ['0', 'D']];
const ORIGENES = [
  ['evento', 'Agenda', '#334155'], ['salud', 'Salud', '#0d9488'], ['stock', 'Stock bajo', '#dc2626'], ['etapa', 'Cambio de etapa', '#ca8a04'],
];
const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white';

const EVENTO_VACIO = {
  titulo: '', tipo: 'General', fecha: hoyISO(), hora: '', descripcion: '', recurrencia: 'Ninguna', diasSemana: '',
  fechaFin: '', notificarCorreo: false, correoDestino: '', idEmpleado: '',
};

function EventoForm({ inicial, empleados, onSubmit, onCancel, onEliminar, onEnviarCorreo }) {
  const [form, setForm] = useState(inicial);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const dias = new Set((form.diasSemana || '').split(',').filter(Boolean));
  const alternarDia = (d) => {
    const n = new Set(dias); n.has(d) ? n.delete(d) : n.add(d);
    setForm({ ...form, diasSemana: [...n].sort().join(',') });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <input required value={form.titulo} onChange={set('titulo')} placeholder="Título del evento" className={inputCls} />
      <div className="grid grid-cols-3 gap-3">
        <select value={form.tipo} onChange={set('tipo')} className={inputCls}>{TIPOS.map(t => <option key={t}>{t}</option>)}</select>
        <input type="date" required value={form.fecha} onChange={set('fecha')} className={inputCls} />
        <input type="time" value={form.hora || ''} onChange={set('hora')} className={inputCls} />
      </div>
      <select value={form.idEmpleado} onChange={set('idEmpleado')} className={inputCls}>
        <option value="">Responsable (yo)</option>
        {empleados.map(e => <option key={e.idEmpleado} value={e.idEmpleado}>{e.nombreCompleto}</option>)}
      </select>
      <textarea rows={2} value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción" className={inputCls} />

      <div className="p-4 rounded-xl border border-slate-200 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5"><Repeat size={13} /> Repetición</p>
        <div className="flex gap-2">
          {['Ninguna', 'Semanal', 'Mensual'].map(r => (
            <button type="button" key={r} onClick={() => setForm({ ...form, recurrencia: r, diasSemana: r === 'Semanal' && !form.diasSemana ? String(new Date(`${form.fecha}T12:00`).getDay()) : form.diasSemana })}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${form.recurrencia === r ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>
              {r === 'Ninguna' ? 'No se repite' : r === 'Semanal' ? 'Cada semana' : 'Cada mes'}
            </button>
          ))}
        </div>
        {form.recurrencia === 'Semanal' && (
          <div className="flex gap-1.5">
            {DIAS.map(([v, l]) => (
              <button type="button" key={v} onClick={() => alternarDia(v)}
                className={`w-9 h-9 rounded-full text-xs font-bold ${dias.has(v) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{l}</button>
            ))}
          </div>
        )}
        {form.recurrencia !== 'Ninguna' && (
          <label className="text-xs text-slate-500 flex items-center gap-2">Termina el (opcional)
            <input type="date" value={form.fechaFin || ''} onChange={set('fechaFin')} className="px-2 py-1 rounded-lg border border-slate-200 text-sm" />
          </label>
        )}
      </div>

      <div className="p-4 rounded-xl border border-slate-200 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={form.notificarCorreo} onChange={set('notificarCorreo')} className="w-4 h-4 accent-emerald-600" />
          <Mail size={15} className="text-slate-400" /> Enviar recordatorio por correo el día del evento
        </label>
        {form.notificarCorreo && (
          <input value={form.correoDestino || ''} onChange={set('correoDestino')} placeholder="Correos separados por coma (vacío = administradores)" className={inputCls} />
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2 pt-2">
        <div className="flex gap-2">
          {onEliminar && <button type="button" onClick={onEliminar} className="px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"><Trash2 size={15} /> Eliminar</button>}
          {onEnviarCorreo && <button type="button" onClick={onEnviarCorreo} className="px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 inline-flex items-center gap-1.5"><Send size={15} /> Enviar correo ahora</button>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">Guardar</button>
        </div>
      </div>
    </form>
  );
}

export default function CalendarioView({ showToast, usuario }) {
  const calendarRef = useRef(null);
  const [ocurrencias, setOcurrencias] = useState([]);
  const [eventosGuardados, setEventosGuardados] = useState([]);
  const [proximos, setProximos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [rango, setRango] = useState(null);
  const [visibles, setVisibles] = useState(new Set(ORIGENES.map(o => o[0])));
  const [modalForm, setModalForm] = useState(null); // datos del formulario
  const [detalle, setDetalle] = useState(null);     // ocurrencia automática seleccionada
  const [error, setError] = useState('');

  const notificar = useCallback((message, type = 'success') => (showToast ? showToast({ message, type }) : alert(message)), [showToast]);

  const cargar = useCallback(async () => {
    if (!rango) return;
    try {
      const [occ, guardados, prox] = await Promise.all([
        api('/api/eventos/calendario', { query: rango }),
        api('/api/eventos'),
        api('/api/eventos/proximos', { query: { dias: 7 } }),
      ]);
      setOcurrencias(occ); setEventosGuardados(guardados); setProximos(prox); setError('');
    } catch (e) { setError(e.message); }
  }, [rango]);

  useEffect(() => { const t = setTimeout(cargar, 0); return () => clearTimeout(t); }, [cargar]);
  useEffect(() => { api('/api/empleados').then(setEmpleados).catch(() => {}); }, []);

  const guardar = async (form) => {
    const cuerpo = { ...form, idEmpleado: form.idEmpleado || usuario?.idEmpleado };
    if (form.recurrencia === 'Semanal' && !form.diasSemana) return notificar('Elige al menos un día de la semana.', 'error');
    try {
      if (form.idEvento) await api(`/api/eventos/${form.idEvento}`, { method: 'PUT', body: cuerpo });
      else await api('/api/eventos', { method: 'POST', body: cuerpo });
      setModalForm(null); await cargar(); notificar('Evento guardado.');
    } catch (e) { notificar(e.message, 'error'); }
  };

  const eliminar = async () => {
    if (!confirm('¿Eliminar este evento' + (modalForm.recurrencia !== 'Ninguna' ? ' y todas sus repeticiones' : '') + '?')) return;
    try { await api(`/api/eventos/${modalForm.idEvento}`, { method: 'DELETE' }); setModalForm(null); await cargar(); notificar('Evento eliminado.'); }
    catch (e) { notificar(e.message, 'error'); }
  };

  const enviarCorreo = async () => {
    try { const r = await api(`/api/eventos/${modalForm.idEvento}/enviar-correo`, { method: 'POST' }); notificar(r.message, r.simulado ? 'info' : 'success'); }
    catch (e) { notificar(e.message, 'error'); }
  };

  const abrirEvento = (idEvento) => {
    const e = eventosGuardados.find(x => x.idEvento === idEvento);
    if (e) setModalForm({ ...EVENTO_VACIO, ...e, hora: e.hora || '', fechaFin: e.fechaFin || '', diasSemana: e.diasSemana || '', correoDestino: e.correoDestino || '', idEmpleado: e.idEmpleado || '' });
  };

  const alClic = ({ event }) => {
    if (event.extendedProps.idEvento) return abrirEvento(event.extendedProps.idEvento);
    setDetalle({ title: event.title, ...event.extendedProps });
  };

  const alSoltar = async ({ event, revert }) => {
    const idEvento = event.extendedProps.idEvento;
    try {
      const fecha = event.startStr.slice(0, 10);
      const hora = event.allDay ? undefined : event.startStr.slice(11, 16);
      await api(`/api/eventos/${idEvento}/mover`, { method: 'PATCH', body: { fecha, ...(hora ? { hora } : {}) } });
      await cargar(); notificar('Evento reprogramado.');
    } catch (e) { revert(); notificar(e.message, 'error'); }
  };

  const eventosFC = ocurrencias
    .filter(o => visibles.has(o.origen))
    .map(o => ({ ...o, extendedProps: { ...o.extendedProps, idEvento: o.idEvento, origen: o.origen } }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><CalendarDays className="text-emerald-600" /> Agenda del Rancho</h1>
          <p className="text-slate-500 text-sm mt-1">Eventos, vacunaciones del módulo de Salud, alertas de stock y cambios de etapa en un solo lugar.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
            setModalForm({ ...EVENTO_VACIO, titulo: 'Pago a empleados', tipo: 'Pago', fecha: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, hora: '09:00', recurrencia: 'Semanal', diasSemana: '6', notificarCorreo: true });
          }} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2">
            <Wallet size={16} /> Pago semanal
          </button>
          <button onClick={() => setModalForm({ ...EVENTO_VACIO })} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm">
            <Plus size={18} /> Nuevo evento
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 calendario-rancho">
          <div className="flex flex-wrap gap-2 mb-3">
            {ORIGENES.map(([id, label, color]) => (
              <button key={id} onClick={() => { const n = new Set(visibles); n.has(id) ? n.delete(id) : n.add(id); setVisibles(n); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 transition ${visibles.has(id) ? 'bg-white border-slate-300 text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} /> {label}
              </button>
            ))}
          </div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listMonth' }}
            height="auto"
            events={eventosFC}
            editable
            eventStartEditable
            eventDurationEditable={false}
            dayMaxEvents={3}
            datesSet={({ startStr, endStr }) => setRango(r => (r?.desde === startStr.slice(0, 10) && r?.hasta === endStr.slice(0, 10) ? r : { desde: startStr.slice(0, 10), hasta: endStr.slice(0, 10) }))}
            dateClick={({ dateStr }) => setModalForm({ ...EVENTO_VACIO, fecha: dateStr.slice(0, 10), hora: dateStr.length > 10 ? dateStr.slice(11, 16) : '' })}
            eventClick={alClic}
            eventDrop={alSoltar}
          />
        </div>

        <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Clock size={16} className="text-emerald-600" /> Próximos 7 días</h2>
          {proximos.length === 0 ? <p className="text-sm text-slate-400">Nada programado.</p> : (
            <ul className="space-y-3">
              {proximos.slice(0, 12).map(o => (
                <li key={o.id} className="flex gap-3 cursor-pointer group" onClick={() => (o.idEvento ? abrirEvento(o.idEvento) : setDetalle({ title: o.title, ...o.extendedProps }))}>
                  <span className="w-1 rounded-full flex-shrink-0" style={{ background: o.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-emerald-700">{o.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(`${o.extendedProps.fecha}T12:00`).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {!o.allDay && ` · ${String(o.start).slice(11, 16)}`}
                      {o.extendedProps.recurrencia && o.extendedProps.recurrencia !== 'Ninguna' && ' · 🔁'}
                      {o.extendedProps.notificarCorreo && ' · ✉️'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <Modal open={!!modalForm} onClose={() => setModalForm(null)} title={modalForm?.idEvento ? 'Editar evento' : 'Nuevo evento'}>
        {modalForm && (
          <EventoForm inicial={modalForm} empleados={empleados} onSubmit={guardar} onCancel={() => setModalForm(null)}
            onEliminar={modalForm.idEvento ? eliminar : null} onEnviarCorreo={modalForm.idEvento ? enviarCorreo : null} />
        )}
      </Modal>
      <Modal open={!!detalle} onClose={() => setDetalle(null)} title={detalle?.title}>
        {detalle && (
          <div className="space-y-3 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase text-slate-400">Evento automático · {detalle.tipo}</p>
            <p>{detalle.descripcion}</p>
            {detalle.responsable && <p className="flex items-center gap-2"><User size={14} /> {detalle.responsable}</p>}
            <p className="text-xs text-slate-400">
              {detalle.origen === 'salud' && 'Proviene del módulo de Salud: edítalo desde ahí.'}
              {detalle.origen === 'stock' && 'Desaparece cuando el artículo se reabastece en Inventario.'}
              {detalle.origen === 'etapa' && 'Calculado con la fecha de nacimiento y las etapas configuradas para su especie.'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
