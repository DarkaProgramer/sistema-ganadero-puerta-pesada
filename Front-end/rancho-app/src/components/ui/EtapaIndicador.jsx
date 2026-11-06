// EtapaIndicador.jsx — Etapa de desarrollo actual calculada automáticamente, para la ficha del animal (Tarjeta 7)
import { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';
import { api, formatoFecha } from '../../utils/http';

import { COLOR_ETAPA } from './coloresEtapa';

const textoEdad = (meses) => {
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  return `${anios} ${anios === 1 ? 'año' : 'años'}${resto ? ` ${resto} m` : ''}`;
};

export default function EtapaIndicador({ idAnimal, fechaNacimiento }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let vivo = true;
    api(`/api/etapas/animal/${idAnimal}`).then(d => { if (vivo) setInfo(d); }).catch(() => { if (vivo) setInfo({ sinDatos: true }); });
    return () => { vivo = false; };
  }, [idAnimal, fechaNacimiento]);

  if (!info) return null;
  if (info.sinDatos) {
    return (
      <div className="p-5 rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500 flex items-center gap-3">
        <Sprout size={20} className="text-slate-300" />
        Registra la fecha de nacimiento para calcular la etapa de desarrollo automáticamente.
      </div>
    );
  }

  const color = COLOR_ETAPA[info.etapa.color] || COLOR_ETAPA.emerald;
  // Línea de tiempo: las etapas sin final se dibujan con el ancho de la anterior
  const anchos = info.etapas.map((e, i, arr) => (e.mesFin ?? (e.mesInicio + Math.max(6, (arr[i - 1]?.mesFin ?? 6) - (arr[i - 1]?.mesInicio ?? 0)))) - e.mesInicio);
  const totalMeses = anchos.reduce((s, a) => s + a, 0);
  // Marcador: inicio del segmento actual + meses transcurridos dentro de la etapa
  const inicioActual = anchos.slice(0, info.indice).reduce((s, a) => s + a, 0);
  const posicion = inicioActual + Math.min(anchos[info.indice], info.edadMeses - info.etapa.mesInicio + 0.5);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color.suave}`}><Sprout size={22} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Etapa de desarrollo actual</p>
            <p className="text-xl font-bold text-slate-800">{info.etapa.nombre} <span className="text-sm font-medium text-slate-400">· {textoEdad(info.edadMeses)}</span></p>
          </div>
        </div>
        <div className="text-right text-sm">
          {info.siguiente ? (
            <>
              <p className="text-slate-500">Pasa a <strong className="text-slate-700">{info.siguiente.nombre}</strong></p>
              <p className="text-xs text-slate-400">{info.diasParaSiguiente > 0 ? `en ${info.diasParaSiguiente} días` : 'hoy'} · {formatoFecha(info.fechaProximaEtapa)}</p>
            </>
          ) : <p className="text-xs text-slate-400">Última etapa configurada</p>}
        </div>
      </div>

      <div className="mt-5">
        <div className="relative flex h-3 rounded-full overflow-hidden bg-slate-100">
          {info.etapas.map((e, i) => (
            <div key={e.idEtapa} className={`${(COLOR_ETAPA[e.color] || COLOR_ETAPA.emerald).bg} ${i === info.indice ? '' : i < info.indice ? 'opacity-40' : 'opacity-15'} ${i ? 'border-l-2 border-white' : ''}`}
              style={{ width: `${(anchos[i] / totalMeses) * 100}%` }} title={`${e.nombre}: ${e.mesInicio}–${e.mesFin ?? '∞'} meses`} />
          ))}
          <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-slate-800 shadow"
            style={{ left: `${Math.min(98.5, Math.max(1.5, (posicion / totalMeses) * 100))}%` }} />
        </div>
        <div className="flex mt-2 text-[11px] text-slate-500">
          {info.etapas.map((e, i) => (
            <div key={e.idEtapa} style={{ width: `${(anchos[i] / totalMeses) * 100}%` }} className={`truncate pr-1 ${i === info.indice ? 'font-bold text-slate-800' : ''}`}>
              {e.nombre}<span className="block text-slate-400 font-normal">{e.mesInicio}{e.mesFin != null ? `–${e.mesFin}` : '+'} m</span>
            </div>
          ))}
        </div>
      </div>
      {info.etapa.mesFin != null && (
        <p className="text-xs text-slate-400 mt-3">Avance dentro de la etapa: {info.progreso}%</p>
      )}
    </div>
  );
}
