// NotificacionesView.jsx — Vista detallada del centro de notificaciones (Tarjeta 6)
import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw, Circle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api, formatoFechaHora } from '../utils/http';
import { ICONO_TIPO, SEVERIDAD_DOT } from '../components/layout/notificacionesConfig';

const TIPOS = ['Endogamia', 'Stock', 'Evento', 'Incidencia', 'Etapa'];
const ETIQUETA = { Endogamia: 'Genética', Stock: 'Inventario', Evento: 'Calendario', Incidencia: 'Reportes', Etapa: 'Etapas' };

// Avisa a la campanita del header que debe refrescarse
const avisarCampana = () => window.dispatchEvent(new Event('notificaciones:actualizar'));

export default function NotificacionesView({ setActiveView, showToast }) {
  const [datos, setDatos] = useState({ notificaciones: [], noLeidas: 0 });
  const [estado, setEstado] = useState('todas');
  const [tipo, setTipo] = useState('');
  const [cargando, setCargando] = useState(true);

  const notificar = useCallback((message, type = 'success') => (showToast ? showToast({ message, type }) : alert(message)), [showToast]);

  const cargar = useCallback(async (refrescar = false) => {
    try {
      setDatos(await api('/api/notificaciones', { query: { estado: estado === 'noLeidas' ? 'noLeidas' : undefined, tipo, refrescar: refrescar ? 1 : undefined } }));
    } catch (e) { notificar(e.message, 'error'); }
    finally { setCargando(false); }
  }, [estado, tipo, notificar]);

  useEffect(() => { const t = setTimeout(cargar, 0); return () => clearTimeout(t); }, [cargar]);

  const accion = async (fn, mensaje) => {
    try { await fn(); await cargar(); avisarCampana(); if (mensaje) notificar(mensaje); } catch (e) { notificar(e.message, 'error'); }
  };

  const alternarLeida = (n) => accion(() => api(`/api/notificaciones/${n.idNotificacion}`, { method: 'PATCH', body: { leida: !n.leida } }));
  const borrar = (n) => accion(() => api(`/api/notificaciones/${n.idNotificacion}`, { method: 'DELETE' }));
  const leerTodas = () => accion(() => api('/api/notificaciones/leer-todas', { method: 'PATCH' }), 'Todas marcadas como leídas.');
  const borrarLeidas = () => {
    if (!confirm('¿Eliminar todas las notificaciones leídas?')) return;
    accion(() => api('/api/notificaciones', { method: 'DELETE', query: { soloLeidas: 1 } }), 'Notificaciones leídas eliminadas.');
  };

  const conteoPorTipo = datos.notificaciones.reduce((acc, n) => ({ ...acc, [n.tipo]: (acc[n.tipo] || 0) + (n.leida ? 0 : 1) }), {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Bell className="text-emerald-600" /> Centro de Notificaciones</h1>
          <p className="text-slate-500 text-sm mt-1">Endogamia, stock, calendario, reportes del personal y cambios de etapa.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => cargar(true)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw size={15} /> Actualizar</button>
          <button onClick={leerTodas} disabled={!datos.noLeidas} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1.5"><CheckCheck size={15} /> Marcar todas</button>
          <button onClick={borrarLeidas} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"><Trash2 size={15} /> Borrar leídas</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-white border border-slate-200 p-1 text-xs font-semibold">
          {[['todas', 'Todas'], ['noLeidas', `Sin leer (${datos.noLeidas})`]].map(([id, label]) => (
            <button key={id} onClick={() => setEstado(id)} className={`px-3 py-1.5 rounded-lg ${estado === id ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>{label}</button>
          ))}
        </div>
        <button onClick={() => setTipo('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${!tipo ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>Todos los tipos</button>
        {TIPOS.map(t => {
          const Icon = ICONO_TIPO[t].icon;
          return (
            <button key={t} onClick={() => setTipo(tipo === t ? '' : t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 ${tipo === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>
              <Icon size={13} /> {ETIQUETA[t]} {!tipo && conteoPorTipo[t] ? <span className="opacity-70">({conteoPorTipo[t]})</span> : null}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cargando ? <p className="p-12 text-center text-slate-400 text-sm">Cargando…</p>
          : datos.notificaciones.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm"><CheckCircle2 className="mx-auto mb-2 text-emerald-400" /> Sin notificaciones en esta vista.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {datos.notificaciones.map(n => {
                const cfg = ICONO_TIPO[n.tipo] || ICONO_TIPO.Evento;
                const Icon = cfg.icon;
                return (
                  <li key={n.idNotificacion} className={`p-4 flex gap-4 ${n.leida ? 'bg-white' : 'bg-emerald-50/30'}`}>
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.cls}`}><Icon size={18} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {!n.leida && <span className={`w-2 h-2 rounded-full ${SEVERIDAD_DOT[n.severidad]}`} />}
                        <p className={`text-sm ${n.leida ? 'text-slate-600' : 'font-semibold text-slate-800'}`}>{n.titulo}</p>
                        {n.severidad === 'critico' && <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Crítico</span>}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{n.mensaje}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-400">{ETIQUETA[n.tipo] || n.tipo} · {formatoFechaHora(n.fecha)}</span>
                        {n.vista && setActiveView && (
                          <button onClick={() => { if (!n.leida) alternarLeida(n); setActiveView(n.vista); }} className="font-semibold text-emerald-600 inline-flex items-center gap-1 hover:underline">Ir al módulo <ArrowRight size={12} /></button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => alternarLeida(n)} title={n.leida ? 'Marcar como no leída' : 'Marcar como leída'} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                        {n.leida ? <Circle size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                      <button onClick={() => borrar(n)} title="Eliminar" className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
      </div>
      <p className="text-xs text-slate-400 text-center">Las alertas se recalculan automáticamente; una notificación eliminada no vuelve a aparecer mientras la condición siga igual.</p>
    </div>
  );
}
