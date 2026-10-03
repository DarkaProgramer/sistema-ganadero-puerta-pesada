// src/views/AnimalDetalleView.jsx — Ficha de trazabilidad, Línea Genética y Cuenta Regresiva de Destete (6 meses)
import { useState, useEffect } from 'react';
import { ArrowLeft, Scale, Building2, Calendar, Plus, Edit3, Trash2, GitFork, Beef, AlertTriangle, Clock } from 'lucide-react';
import { RegistrarPesoForm } from './forms/HistorialAnimalForm';

export default function AnimalDetalleView({ animalId, onBack, showToast }) {
  const [animal, setAnimal] = useState(null);
  const [historicos, setHistoricos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales de peso individual
  const [modalPesoOpen, setModalPesoOpen] = useState(false);
  const [historicoAEditar, setHistoricoAEditar] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function cargarDatosDetalle() {
      try {
        // 1. Obtener datos generales del animal
        const resAnimal = await fetch('http://localhost:4000/api/animales');
        if (resAnimal.ok) {
          const lista = await resAnimal.json();
          const encontrado = lista.find(a => Number(a.idAnimal) === Number(animalId));
          if (isMounted) setAnimal(encontrado);
        }

        // 2. Obtener historial de pesajes
        const resHist = await fetch(`http://localhost:4000/api/historicos/animal/${animalId}`);
        if (resHist.ok) {
          const dataHist = await resHist.json();
          if (isMounted) setHistoricos(dataHist);
        }
      } catch (err) {
        console.error('Error al cargar la ficha del animal:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    cargarDatosDetalle();

    return () => {
      isMounted = false;
    };
  }, [animalId]);

  const recargarDatos = async () => {
    try {
      const resHist = await fetch(`http://localhost:4000/api/historicos/animal/${animalId}`);
      if (resHist.ok) {
        const dataHist = await resHist.json();
        setHistoricos(dataHist);
      }
    } catch (err) {
      console.error('Error al recargar historicos:', err);
    }
  };

  const handleGuardarPeso = async (formData) => {
    try {
      const url = historicoAEditar 
        ? `http://localhost:4000/api/historicos/${historicoAEditar.idHistorico}`
        : `http://localhost:4000/api/historicos/animal/${animalId}`;
      
      const method = historicoAEditar ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setModalPesoOpen(false);
        setHistoricoAEditar(null);
        await recargarDatos();
        showToast({ 
          message: historicoAEditar ? 'Pesaje actualizado con éxito.' : 'Pesaje registrado con éxito.', 
          type: 'success' 
        });
      } else {
        showToast({ message: 'Error al procesar el pesaje.', type: 'error' });
      }
    } catch {
      showToast({ message: 'Error de red.', type: 'error' });
    }
  };

  const handleEliminarPeso = async (idHistorico) => {
    if (!confirm('¿Estás seguro de eliminar este registro de peso?')) return;

    try {
      const res = await fetch(`http://localhost:4000/api/historicos/${idHistorico}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await recargarDatos();
        showToast({ message: 'Registro de peso eliminado.', type: 'success' });
      } else {
        showToast({ message: 'Error al eliminar.', type: 'error' });
      }
    } catch {
      showToast({ message: 'Error de red.', type: 'error' });
    }
  };

  // ── Cálculo del Estado de Lactancia y Destete (6 meses) ──
  const calcularDestete = (fechaNacimiento, origen) => {
    if (!fechaNacimiento || origen !== 'Nacimiento') return null;
    const nac = new Date(fechaNacimiento);
    const desteteMeta = new Date(nac);
    desteteMeta.setMonth(desteteMeta.getMonth() + 6); // 6 meses de lactancia

    const hoy = new Date();
    const diffTime = desteteMeta - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      fechaDesteteMeta: desteteMeta.toLocaleDateString(),
      diasRestantes: diffDays,
      cumplido: diffDays <= 0
    };
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando ficha de trazabilidad...</div>;
  if (!animal) return <div className="p-12 text-center text-red-500">No se encontró información del animal.</div>;

  const infoDestete = calcularDestete(animal.fechaNacimiento, animal.origen);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Botón regresar */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition"
      >
        <ArrowLeft size={18} /> Volver al listado de ganado
      </button>

      {/* Cabecera de Identidad */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-100 uppercase tracking-wider">
              {animal.tipoAnimal?.nombre || 'Ganado'}
            </span>
            <span className={`px-3 py-1 font-semibold text-xs rounded-full ${
              animal.estado === 'Vivo' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {animal.estado}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            {animal.nombre || 'Sin nombre asignado'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Arete Bandera: <strong className="text-slate-800">{animal.areteBandera}</strong> {animal.areteBoton && `| Arete Botón: ${animal.areteBoton}`}
          </p>
        </div>

        <button
          onClick={() => { setHistoricoAEditar(null); setModalPesoOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={16} /> Registrar Pesaje
        </button>
      </div>

      {/* Alerta Visual de Destete / Cambio de Corral (Si aplica a nacimientos) */}
      {infoDestete && (
        <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
          infoDestete.cumplido 
            ? 'bg-amber-50 border-amber-200 text-amber-800' 
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}>
          <div className={`p-3 rounded-xl ${infoDestete.cumplido ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {infoDestete.cumplido ? <AlertTriangle size={24} /> : <Clock size={24} />}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">
              {infoDestete.cumplido 
                ? '⚠️ Periodo de Lactancia Concluido (Destete Sugerido)' 
                : '🥛 Control de Lactancia y Destete (Meta: 6 meses)'}
            </h4>
            <p className="text-xs mt-0.5 opacity-90">
              {infoDestete.cumplido 
                ? `Este animal cumplió su ciclo de 6 meses con la madre el ${infoDestete.fechaDesteteMeta}. Se recomienda realizar el cambio de corral o separación.`
                : `Faltan ${infoDestete.diasRestantes} días (aproximadamente el ${infoDestete.fechaDesteteMeta}) para cumplir los 6 meses de lactancia y requerir cambio de corral.`}
            </p>
          </div>
        </div>
      )}

      {/* Grid de Datos Técnicos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corral Asignado</p>
          <p className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
            <Building2 size={16} className="text-emerald-600" /> {animal.corral?.nombre || 'Sin asignar'}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raza / Género</p>
          <p className="text-base font-bold text-slate-800 mt-1">
            {animal.raza?.nombre || 'N/D'} {animal.detalleMestizo ? `(${animal.detalleMestizo})` : ''} • <span className="text-emerald-700 font-medium">{animal.genero}</span>
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Origen</p>
          <p className="text-base font-bold text-slate-800 mt-1">
            {animal.origen}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Ingreso</p>
          <p className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
            <Calendar size={16} className="text-emerald-600" /> {new Date(animal.fechaIngreso).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Sección de Línea Genética */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
          <GitFork size={20} className="text-emerald-600" /> Línea Genética / Genealogía
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Padre */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <Beef size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Padre (Semental)</span>
              {animal.padre ? (
                <>
                  <p className="text-base font-bold text-slate-800 mt-0.5 font-mono">
                    {animal.padre.areteBandera}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {animal.padre.nombre ? `Nombre: ${animal.padre.nombre}` : 'Sin nombre registrado'}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-slate-500 mt-1 italic">
                  No registrado / Desconocido (Compra externa o sin registro)
                </p>
              )}
            </div>
          </div>

          {/* Madre */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <Beef size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Madre</span>
              {animal.madre ? (
                <>
                  <p className="text-base font-bold text-slate-800 mt-0.5 font-mono">
                    {animal.madre.areteBandera}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {animal.madre.nombre ? `Nombre: ${animal.madre.nombre}` : 'Sin nombre registrado'}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-slate-500 mt-1 italic">
                  No registrado / Desconocido (Compra externa o sin registro)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Pesos en Detalle */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Scale size={20} className="text-emerald-600" /> Historial de Pesajes ({historicos.length})
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {historicos.length === 0 ? (
            <p className="text-center py-12 text-slate-400 text-sm">No hay registros de peso para este animal.</p>
          ) : (
            historicos.map(h => (
              <div key={h.idHistorico} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-lg font-bold text-slate-800 block">{h.peso} kg</span>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Etapa: {h.etapa}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-slate-500">
                    {new Date(h.fecha).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setHistoricoAEditar(h); setModalPesoOpen(true); }}
                      className="p-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl border border-slate-200/60 transition shadow-sm"
                      title="Editar peso"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleEliminarPeso(h.idHistorico)}
                      className="p-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl border border-slate-200/60 transition shadow-sm"
                      title="Eliminar peso"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Registrar / Editar Peso */}
      {modalPesoOpen && (
        <RegistrarPesoForm
          historicoAEditar={historicoAEditar}
          animal={animal}
          onSubmit={handleGuardarPeso}
          onCancel={() => { setModalPesoOpen(false); setHistoricoAEditar(null); }}
        />
      )}
    </div>
  );
}