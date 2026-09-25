// CalendarioView.jsx — Agenda de eventos con simulación de aviso por correo

import { useState } from 'react';
import { CalendarDays, Mail, Clock, User, CheckCircle2, Syringe, Wrench, TrendingUp, Package, DollarSign, Stethoscope } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { eventos as eventosInic } from '../data/mockData';

const TIPOS_EVENTO = [
  { value: 'vacunacion',    label: 'Vacunación'     },
  { value: 'mantenimiento', label: 'Mantenimiento'  },
  { value: 'venta',         label: 'Venta'          },
  { value: 'veterinaria',   label: 'Veterinaria'    },
  { value: 'inventario',    label: 'Inventario'     },
  { value: 'cobro',         label: 'Cobro'          },
];

const RESPONSABLES = ['Dr. Carlos Torres', 'Ing. Luis Herrera', 'Ing. Marco Ruiz', 'Mec. Pedro Salinas'];

const FORM_INIT = {
  titulo: '', tipo: 'vacunacion', fecha: '', hora: '08:00',
  responsable: RESPONSABLES[0], descripcion: '',
};

const TIPO_ICONS = {
  vacunacion:    <Syringe size={18} className="text-teal-600"    />,
  mantenimiento: <Wrench  size={18} className="text-orange-600"  />,
  venta:         <TrendingUp size={18} className="text-emerald-600" />,
  veterinaria:   <Stethoscope size={18} className="text-rose-600" />,
  inventario:    <Package size={18} className="text-sky-600"     />,
  cobro:         <DollarSign size={18} className="text-violet-600" />,
};

export default function CalendarioView({ showToast }) {
  const [eventos, setEventos]       = useState(eventosInic);
  const [modalOpen, setModal]       = useState(false);
  const [avisosEnviados, setAvisos] = useState({});
  const [form, setForm]             = useState(FORM_INIT);
  const [error, setError]           = useState('');

  // Ordenar por fecha
  const eventosOrdenados = [...eventos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Separar próximos vs pasados
  const hoy    = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximos = eventosOrdenados.filter(e => new Date(e.fecha) >= hoy);
  const pasados  = eventosOrdenados.filter(e => new Date(e.fecha) <  hoy);

  const enviarAviso = (ev) => {
    setAvisos(prev => ({ ...prev, [ev.id]: true }));
    showToast({
      message: `✉️ Aviso enviado a ${ev.responsable} por el evento "${ev.titulo}" (${ev.fecha} ${ev.hora}).`,
      type: 'success',
    });
  };

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!form.titulo || !form.fecha) {
      setError('El título y la fecha son obligatorios.');
      return;
    }
    const nuevo = { id: eventos.length + 1, ...form };
    setEventos(prev => [nuevo, ...prev]);
    setModal(false);
    setForm(FORM_INIT);
    setError('');
    showToast({ message: `Evento "${nuevo.titulo}" agregado al calendario.`, type: 'success' });
  };

  const CardEvento = ({ ev }) => {
    const yaEnviado = avisosEnviados[ev.id];
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
        <div className="flex items-start gap-3">
          {/* Ícono tipo */}
          <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
            {TIPO_ICONS[ev.tipo] ?? <CalendarDays size={18} className="text-slate-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800 text-sm leading-snug">{ev.titulo}</p>
                <Badge estado={ev.tipo} className="mt-1" />
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.descripcion}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><CalendarDays size={11} /> {ev.fecha}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {ev.hora}</span>
              <span className="flex items-center gap-1"><User size={11} /> {ev.responsable}</span>
            </div>

            {/* Botón de aviso */}
            <button
              onClick={() => enviarAviso(ev)}
              disabled={yaEnviado}
              className={`mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                yaEnviado
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default'
                  : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {yaEnviado
                ? <><CheckCircle2 size={13} /> Aviso enviado</>
                : <><Mail size={13} /> Enviar aviso por correo</>
              }
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ── Cabecera con acción ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">{proximos.length} evento(s) próximo(s)</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <CalendarDays size={15} /> Agregar evento
        </button>
      </div>

      {/* ── Próximos eventos ──────────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
          Próximos eventos
        </h3>
        {proximos.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400">
            <CalendarDays size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay eventos próximos agendados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {proximos.map(ev => <CardEvento key={ev.id} ev={ev} />)}
          </div>
        )}
      </section>

      {/* ── Eventos pasados ───────────────────────────────── */}
      {pasados.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-300 rounded-full inline-block" />
            Eventos anteriores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-60">
            {pasados.map(ev => <CardEvento key={ev.id} ev={ev} />)}
          </div>
        </section>
      )}

      {/* ── Modal: Agregar evento ────────────────────────── */}
      <Modal open={modalOpen} onClose={() => { setModal(false); setError(''); }} title="Agregar Nuevo Evento">
        <form onSubmit={handleAgregar} className="space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Título del evento <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej: Vacunación Corral A1"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Tipo de evento</label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS_EVENTO.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, tipo: value }))}
                  className={`py-2 text-xs rounded-lg border font-medium transition-all ${form.tipo === value ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-400'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Hora</label>
              <input type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Responsable</label>
            <select value={form.responsable} onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Detalles del evento..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setModal(false); setError(''); }}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">Agregar al calendario</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
