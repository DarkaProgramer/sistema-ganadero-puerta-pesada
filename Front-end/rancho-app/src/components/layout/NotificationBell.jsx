// NotificationBell.jsx — Campanita del header con las alertas consolidadas del sistema (Tarjeta 6)
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { ICONO_TIPO, SEVERIDAD_DOT } from './notificacionesConfig';
import { api, tiempoRelativo } from '../../utils/http';

const INTERVALO_MS = 60_000;

export default function NotificationBell({ onNavegar }) {
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState({ notificaciones: [], noLeidas: 0 });
  const ref = useRef(null);

  const cargar = useCallback(async () => {
    try { setDatos(await api('/api/notificaciones', { query: { limite: 15 } })); } catch { /* el header no debe romperse si falla el API */ }
  }, []);

  useEffect(() => {
    const inicial = setTimeout(cargar, 0);
    const id = setInterval(cargar, INTERVALO_MS);
    window.addEventListener('notificaciones:actualizar', cargar);
    return () => { clearTimeout(inicial); clearInterval(id); window.removeEventListener('notificaciones:actualizar', cargar); };
  }, [cargar]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, [abierto]);

  const abrirNotificacion = async (n) => {
    if (!n.leida) {
      try { await api(`/api/notificaciones/${n.idNotificacion}`, { method: 'PATCH', body: { leida: true } }); } catch { /* sin bloqueo */ }
      cargar();
    }
    setAbierto(false);
    if (n.vista && onNavegar) onNavegar(n.vista);
  };

  const leerTodas = async () => {
    try { await api('/api/notificaciones/leer-todas', { method: 'PATCH' }); cargar(); } catch { /* sin bloqueo */ }
  };

  const recientes = datos.notificaciones.slice(0, 8);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setAbierto(a => !a); if (!abierto) cargar(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label={`Notificaciones (${datos.noLeidas} sin leer)`}>
        <Bell size={20} />
        {datos.noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {datos.noLeidas > 99 ? '99+' : datos.noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-[min(92vw,380px)] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-800 text-sm">Notificaciones {datos.noLeidas > 0 && <span className="text-xs font-normal text-slate-400">· {datos.noLeidas} sin leer</span>}</p>
            {datos.noLeidas > 0 && (
              <button onClick={leerTodas} className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1 hover:underline"><CheckCheck size={14} /> Marcar todas</button>
            )}
          </div>
          <ul className="max-h-[60vh] overflow-y-auto divide-y divide-slate-50">
            {recientes.length === 0 && <li className="p-8 text-center text-sm text-slate-400">Todo en orden 🎉</li>}
            {recientes.map(n => {
              const cfg = ICONO_TIPO[n.tipo] || ICONO_TIPO.Evento;
              const Icon = cfg.icon;
              return (
                <li key={n.idNotificacion}>
                  <button onClick={() => abrirNotificacion(n)} className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 ${n.leida ? 'opacity-60' : ''}`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.cls}`}><Icon size={15} /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 leading-snug">{n.titulo}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{n.mensaje}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tiempoRelativo(n.fecha)}</p>
                    </div>
                    {!n.leida && <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SEVERIDAD_DOT[n.severidad] || SEVERIDAD_DOT.info}`} />}
                  </button>
                </li>
              );
            })}
          </ul>
          <button onClick={() => { setAbierto(false); onNavegar?.('notificaciones'); }}
            className="w-full py-3 text-sm font-semibold text-emerald-700 bg-slate-50 hover:bg-emerald-50 border-t border-slate-100">
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
}
