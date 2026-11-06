// EtapasConfigView.jsx — Parámetros de etapas de desarrollo por tipo de animal (Tarjeta 7)
import { useCallback, useEffect, useRef, useState } from 'react';
import { Sprout, Plus, Trash2, Save, RotateCcw, Info } from 'lucide-react';
import { api, esAdmin } from '../utils/http';
import { COLOR_ETAPA } from '../components/ui/coloresEtapa';

const aBorrador = (etapas) => etapas.map(e => ({ nombre: e.nombre, mesInicio: e.mesInicio, mesFin: e.mesFin ?? '', color: e.color }));
const normalizar = (t = '') => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export default function EtapasConfigView({ showToast, usuario }) {
  const admin = esAdmin(usuario);
  const [tipos, setTipos] = useState([]);
  const [plantillas, setPlantillas] = useState({});
  const [idTipo, setIdTipo] = useState(null);
  const [borrador, setBorrador] = useState([]);
  const [error, setError] = useState('');
  const idTipoRef = useRef(null);

  const notificar = useCallback((message, type = 'success') => (showToast ? showToast({ message, type }) : alert(message)), [showToast]);

  const cargar = useCallback(async () => {
    try {
      const [lista, plant] = await Promise.all([api('/api/etapas'), api('/api/etapas/plantillas')]);
      setTipos(lista); setPlantillas(plant);
      const id = idTipoRef.current ?? lista[0]?.idTipoAnimal ?? null;
      idTipoRef.current = id;
      setIdTipo(id);
      const seleccionado = lista.find(t => t.idTipoAnimal === id);
      if (seleccionado) setBorrador(aBorrador(seleccionado.etapas));
    } catch (e) { setError(e.message); }
  }, []);

  useEffect(() => { const t = setTimeout(cargar, 0); return () => clearTimeout(t); }, [cargar]);

  const tipo = tipos.find(t => t.idTipoAnimal === idTipo);

  // Al cambiar el final de una etapa, la siguiente empieza ahí (mantiene los rangos continuos)
  const cambiar = (i, campo, valor) => setBorrador(b => b.map((e, j) => {
    if (j === i) return { ...e, [campo]: valor };
    if (campo === 'mesFin' && j === i + 1 && valor !== '') return { ...e, mesInicio: Number(valor) };
    return e;
  }));

  const agregar = () => setBorrador(b => {
    const ultima = b[b.length - 1];
    if (!ultima) return [{ nombre: '', mesInicio: 0, mesFin: '', color: 'sky' }];
    const fin = ultima.mesFin === '' ? Number(ultima.mesInicio) + 6 : Number(ultima.mesFin);
    const colores = Object.keys(COLOR_ETAPA);
    return [...b.slice(0, -1), { ...ultima, mesFin: fin }, { nombre: '', mesInicio: fin, mesFin: '', color: colores[b.length % colores.length] }];
  });

  const quitar = (i) => setBorrador(b => {
    const n = b.filter((_, j) => j !== i);
    if (n.length) { n[0] = { ...n[0], mesInicio: 0 }; n[n.length - 1] = { ...n[n.length - 1], mesFin: i === b.length - 1 ? '' : n[n.length - 1].mesFin }; }
    for (let j = 1; j < n.length; j++) if (n[j - 1].mesFin !== '') n[j] = { ...n[j], mesInicio: Number(n[j - 1].mesFin) };
    return n;
  });

  const usarPlantilla = () => {
    const p = plantillas[normalizar(tipo?.nombre)];
    if (!p) return notificar('No hay valores sugeridos para esta especie.', 'info');
    setBorrador(p.map(e => ({ ...e, mesFin: e.mesFin ?? '' })));
  };

  const guardar = async () => {
    try {
      await api(`/api/etapas/tipo/${idTipo}`, { method: 'PUT', body: { etapas: borrador } });
      await cargar(); notificar(`Etapas de ${tipo.nombre} guardadas. La etapa de cada animal se recalcula automáticamente.`);
    } catch (e) { notificar(e.message, 'error'); }
  };

  const total = Math.max(1, ...borrador.map(e => Number(e.mesFin || Number(e.mesInicio) + 6)));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Sprout className="text-emerald-600" /> Etapas de Desarrollo</h1>
        <p className="text-slate-500 text-sm mt-1">Define las etapas por especie. La etapa de cada animal se calcula sola con su fecha de nacimiento.</p>
      </div>
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {tipos.map(t => (
          <button key={t.idTipoAnimal} onClick={() => { idTipoRef.current = t.idTipoAnimal; setIdTipo(t.idTipoAnimal); setBorrador(aBorrador(t.etapas)); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${idTipo === t.idTipoAnimal ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} ${t.activo ? '' : 'opacity-50'}`}>
            {t.nombre} <span className="opacity-70 font-normal">({t.etapas.length})</span>
          </button>
        ))}
      </div>

      {tipo && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          {/* Vista previa */}
          <div>
            <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
              {borrador.map((e, i) => (
                <div key={i} className={`${(COLOR_ETAPA[e.color] || COLOR_ETAPA.emerald).bg} ${i ? 'border-l-2 border-white' : ''}`}
                  style={{ width: `${((Number(e.mesFin || Number(e.mesInicio) + 6) - Number(e.mesInicio)) / total) * 100}%` }} />
              ))}
            </div>
            <div className="flex mt-1.5 text-[11px] text-slate-500">
              {borrador.map((e, i) => (
                <div key={i} className="truncate pr-1" style={{ width: `${((Number(e.mesFin || Number(e.mesInicio) + 6) - Number(e.mesInicio)) / total) * 100}%` }}>
                  {e.nombre || '—'}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Etapa</th><th className="py-2 pr-3">Desde (mes)</th><th className="py-2 pr-3">Hasta (mes)</th><th className="py-2 pr-3">Color</th><th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {borrador.map((e, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                    <td className="py-2 pr-3"><input disabled={!admin} value={e.nombre} onChange={ev => cambiar(i, 'nombre', ev.target.value)} placeholder="Nombre" className="w-40 px-2.5 py-1.5 rounded-lg border border-slate-200" /></td>
                    <td className="py-2 pr-3"><input type="number" min="0" disabled value={e.mesInicio} className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-500" /></td>
                    <td className="py-2 pr-3">
                      <input type="number" min={Number(e.mesInicio) + 1} disabled={!admin} value={e.mesFin} onChange={ev => cambiar(i, 'mesFin', ev.target.value)}
                        placeholder={i === borrador.length - 1 ? 'Sin límite' : ''} className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200" />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-1">
                        {Object.entries(COLOR_ETAPA).map(([c, cls]) => (
                          <button key={c} type="button" disabled={!admin} onClick={() => cambiar(i, 'color', c)}
                            className={`w-5 h-5 rounded-full ${cls.bg} ${e.color === c ? 'ring-2 ring-offset-1 ring-slate-700' : 'opacity-60'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      {admin && borrador.length > 1 && <button onClick={() => quitar(i)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            "Hasta" es el mes en que inicia la siguiente etapa. Ej.: Cría 0–6 significa de recién nacido hasta cumplir 6 meses. La última etapa puede quedar sin límite.
          </p>

          {admin ? (
            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                <button onClick={agregar} className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5"><Plus size={15} /> Agregar etapa</button>
                <button onClick={usarPlantilla} className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5"><RotateCcw size={15} /> Valores sugeridos</button>
              </div>
              <button onClick={guardar} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5"><Save size={15} /> Guardar etapas de {tipo.nombre}</button>
            </div>
          ) : <p className="text-xs text-slate-400">Solo un administrador puede modificar las etapas.</p>}
        </div>
      )}
    </div>
  );
}
