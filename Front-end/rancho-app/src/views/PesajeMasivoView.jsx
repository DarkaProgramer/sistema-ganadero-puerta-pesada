// src/views/PesajeMasivoView.jsx — Pantalla de captura rápida de pesaje masivo con etapa independiente
import { useState, useEffect } from 'react';
import { ArrowLeft, Scale, Building2, Save } from 'lucide-react';

export default function PesajeMasivoView({ onBack, showToast }) {
  const [corrales, setCorrales] = useState([]);
  const [corralSeleccionado, setCorralSeleccionado] = useState('');
  const [animalesCorral, setAnimalesCorral] = useState([]);
  const [pesos, setPesos] = useState({});       // { idAnimal: peso }
  const [etapas, setEtapas] = useState({});     // { idAnimal: etapa }
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function cargarCorrales() {
      try {
        const res = await fetch('http://localhost:4000/api/animales/catalogos');
        if (res.ok) {
          const data = await res.json();
          setCorrales(data.corrales || []);
          if (data.corrales && data.corrales.length > 0) {
            setCorralSeleccionado(data.corrales[0].idCorral);
          }
        }
      } catch (err) {
        console.error('Error al cargar corrales:', err);
      }
    }
    cargarCorrales();
  }, []);

  useEffect(() => {
    if (!corralSeleccionado) return;

    async function cargarAnimalesDelCorral() {
      try {
        const res = await fetch('http://localhost:4000/api/animales');
        if (res.ok) {
          const data = await res.json();
          const filtrados = data.filter(a => Number(a.idCorral) === Number(corralSeleccionado) && a.estado.toLowerCase() === 'vivo');
          setAnimalesCorral(filtrados);
          
          // Inicializar pesos vacíos y etapa por defecto ('Engorda') para cada animal
          const inicialPesos = {};
          const inicialEtapas = {};
          filtrados.forEach(a => { 
            inicialPesos[a.idAnimal] = ''; 
            inicialEtapas[a.idAnimal] = 'Engorda'; 
          });
          setPesos(inicialPesos);
          setEtapas(inicialEtapas);
        }
      } catch (err) {
        console.error('Error al cargar animales:', err);
      }
    }
    cargarAnimalesDelCorral();
  }, [corralSeleccionado]);

  const handlePesoChange = (idAnimal, valor) => {
    setPesos(prev => ({ ...prev, [idAnimal]: valor }));
  };

  const handleEtapaChange = (idAnimal, valor) => {
    setEtapas(prev => ({ ...prev, [idAnimal]: valor }));
  };

  const handleSubmitLote = async (e) => {
    e.preventDefault();

    // Construimos los registros tomando el peso y la etapa específica de cada animal
    const registros = Object.entries(pesos)
      .filter(([, peso]) => peso !== '' && !isNaN(peso))
      .map(([idAnimal, peso]) => ({
        idAnimal: Number(idAnimal),
        peso: Number(peso),
        fecha: fecha,
        etapa: etapas[idAnimal] || 'Engorda'
      }));

    if (registros.length === 0) {
      showToast({ message: 'Por favor ingresa al menos un peso.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      let exitos = 0;
      for (const reg of registros) {
        const res = await fetch(`http://localhost:4000/api/historicos/animal/${reg.idAnimal}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peso: reg.peso, fecha: reg.fecha, etapa: reg.etapa })
        });
        if (res.ok) exitos++;
      }

      showToast({ message: `Se registraron ${exitos} pesajes correctamente.`, type: 'success' });
      onBack();
    } catch (err) {
      console.error('Error de red:', err);
      showToast({ message: 'Error de conexión con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={18} /> Volver al listado
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="text-emerald-600" /> Báscula y Pesaje Masivo por Lote
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Selecciona un corral, anota el peso y asigna la etapa de desarrollo individual de cada animal.
            </p>
          </div>

          {/* Fecha global del pesaje del lote */}
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Fecha de Pesaje</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Selector de Corral */}
        <div className="mb-6 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <Building2 size={20} className="text-emerald-600" />
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 uppercase">Filtrar por Corral a Pesar</label>
            <select
              value={corralSeleccionado}
              onChange={e => setCorralSeleccionado(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {corrales.map(c => (
                <option key={c.idCorral} value={c.idCorral}>
                  {c.nombre} (Capacidad máxima: {c.capacidadMaxima})
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmitLote} className="space-y-6">
          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[450px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase">Arete / Identificador</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase">Nombre</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase">Raza / Género</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase">Etapa de Desarrollo</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase">Nuevo Peso (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {animalesCorral.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400 text-sm">
                      No hay animales activos en este corral.
                    </td>
                  </tr>
                ) : (
                  animalesCorral.map(animal => (
                    <tr key={animal.idAnimal} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-3 text-sm font-bold text-slate-800">
                        {animal.areteBandera}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">
                        {animal.nombre || '—'}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{animal.raza?.nombre || 'N/D'}</span> • {animal.genero}
                      </td>
                      {/* Selector de Etapa por Animal */}
                      <td className="px-6 py-3">
                        <select
                          value={etapas[animal.idAnimal] || 'Engorda'}
                          onChange={e => handleEtapaChange(animal.idAnimal, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700"
                        >
                          <option value="Crecimiento">Crecimiento</option>
                          <option value="Engorda">Engorda</option>
                          <option value="Reproduccion">Reproducción</option>
                          <option value="Destete">Destete</option>
                        </select>
                      </td>
                      {/* Input de Peso por Animal */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            placeholder="0.00"
                            value={pesos[animal.idAnimal] || ''}
                            onChange={e => handlePesoChange(animal.idAnimal, e.target.value)}
                            className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-emerald-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <span className="text-xs text-slate-400 font-medium">kg</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              💡 Tip: Puedes escribir el peso y presionar <kbd className="px-2 py-1 bg-slate-100 border rounded text-slate-700">Tab</kbd> para avanzar de forma fluida.
            </p>
            <button
              type="submit"
              disabled={loading || animalesCorral.length === 0}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} /> Guardar Pesaje del Lote
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}