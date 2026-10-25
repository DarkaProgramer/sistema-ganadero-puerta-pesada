// src/views/forms/SaludForm.jsx — Formulario modular para control sanitario (Grupal o Individual)
import { useState, useEffect } from 'react';
import { Building2, Calendar, User, Package, Users, CheckCircle2, UserPlus, Droplet, ShieldCheck, Stethoscope } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function SaludForm({ corrales, empleados, animales, onSubmit, onCancel }) {
  const [modo, setModo] = useState('masivo'); 

  const [corralSeleccionado, setCorralSeleccionado] = useState(corrales[0]?.idCorral || '');
  const [animalesCorral, setAnimalesCorral] = useState([]);
  
  // Estado para alternar entre empleado de nómina o externo
  const [modoResponsable, setModoResponsable] = useState('nomina'); // 'nomina' o 'externo'

  const [formData, setFormData] = useState({
    tipo: 'Vacunación',
    producto: '',
    dosis: '',
    fecha: new Date().toISOString().split('T')[0],
    idAnimalIndividual: animales[0]?.idAnimal || '',
    responsable: empleados[0]?.idEmpleado || '',
    responsableExterno: '',
    ayudantes: '',
    observacionesGeneral: ''
  });

  const [detalleAnimales, setDetalleAnimales] = useState({});

  useEffect(() => {
    if (modo !== 'masivo' || !corralSeleccionado) return;

    async function cargarAnimalesCorral() {
      try {
        const res = await fetch(`${API_URL}/api/animales`);
        const data = await res.json();
        if (res.ok) {
          const filtrados = data.filter(a => Number(a.idCorral) === Number(corralSeleccionado) && a.estado === 'Vivo');
          setAnimalesCorral(filtrados);

          const esBañoMasivo = formData.tipo === 'Baño Antigarrapatas';
          const inicial = {};
          filtrados.forEach(a => {
            inicial[a.idAnimal] = { 
              aplicado: true, 
              observaciones: esBañoMasivo ? 'Aplicación general en baño' : '' 
            };
          });
          setDetalleAnimales(inicial);
        }
      } catch (err) {
        console.error('Error al cargar animales del corral:', err);
      }
    }
    cargarAnimalesCorral();
  }, [corralSeleccionado, formData.tipo, modo]);

  const handleCheckboxChange = (idAnimal, valor) => {
    setDetalleAnimales(prev => ({
      ...prev,
      [idAnimal]: { ...prev[idAnimal], aplicado: valor }
    }));
  };

  const handleObsChange = (idAnimal, texto) => {
    setDetalleAnimales(prev => ({
      ...prev,
      [idAnimal]: { ...prev[idAnimal], observaciones: texto }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.producto.trim()) {
      alert('Por favor ingresa el producto o medicamento.');
      return;
    }

    // Validación si se seleccionó responsable externo
    if (modoResponsable === 'externo' && !formData.responsableExterno.trim()) {
      alert('Por favor escribe el nombre del médico veterinario externo.');
      return;
    }

    // Si es externo, guardamos el nombre formateado en el campo responsable o nota
    const responsableFinal = modoResponsable === 'externo' 
      ? `Dr. ${formData.responsableExterno.trim()} (Externo)` 
      : formData.responsable;

    let payload;

    if (modo === 'masivo') {
      const tratamientosArray = Object.keys(detalleAnimales).map(idAnimal => ({
        idAnimal: Number(idAnimal),
        aplicado: detalleAnimales[idAnimal].aplicado,
        observaciones: detalleAnimales[idAnimal].observaciones
      }));

      payload = {
        idCorral: corralSeleccionado,
        idAnimalIndividual: null,
        tipo: formData.tipo,
        producto: formData.producto,
        dosis: formData.dosis,
        fecha: formData.fecha,
        responsable: responsableFinal,
        ayudantes: formData.ayudantes,
        observacionesGeneral: formData.observacionesGeneral,
        tratamientos: tratamientosArray
      };
    } else {
      payload = {
        idCorral: null,
        idAnimalIndividual: formData.idAnimalIndividual,
        tipo: formData.tipo,
        producto: formData.producto,
        dosis: formData.dosis,
        fecha: formData.fecha,
        responsable: responsableFinal,
        ayudantes: formData.ayudantes,
        observacionesGeneral: formData.observacionesGeneral,
        tratamientos: [
          {
            idAnimal: Number(formData.idAnimalIndividual),
            aplicado: true,
            observaciones: formData.observacionesGeneral
          }
        ]
      };
    }

    onSubmit(payload);
  };

  const esBaño = formData.tipo === 'Baño Antigarrapatas';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-8 border border-slate-100 my-8 max-h-[90vh] flex flex-col">
        
        {/* Cabecera y Selector de Modo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {modo === 'masivo' ? (
              esBaño ? <Droplet className="text-blue-600" /> : <ShieldCheck className="text-emerald-600" />
            ) : (
              <Stethoscope className="text-purple-600" />
            )}
            {modo === 'masivo' ? 'Registro Sanitario por Lote (Grupal)' : 'Seguimiento Clínico Individual'}
          </h3>

          <div className="flex bg-slate-100 p-1 rounded-2xl self-start">
            <button
              type="button"
              onClick={() => setModo('masivo')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                modo === 'masivo' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Campaña Grupal (Corral)
            </button>
            <button
              type="button"
              onClick={() => setModo('individual')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                modo === 'individual' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Caso Individual (Animal)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 flex-1">
          
          {/* Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tipo de Evento</label>
              <select
                value={formData.tipo}
                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
              >
                <option value="Vacunación">💉 Vacunación</option>
                <option value="Desparasitación">💊 Desparasitación Interna</option>
                <option value="Baño Antigarrapatas">🚿 Baño Antigarrapatas (Externo)</option>
                <option value="Vitaminas">🧪 Complejo Vitamínico</option>
                <option value="Tratamiento Clínico">🩺 Tratamiento Clínico General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Producto / Medicamento</label>
              <div className="relative">
                <Package size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.producto}
                  onChange={e => setFormData({ ...formData, producto: e.target.value })}
                  placeholder={esBaño ? 'Ej. Amitraz' : 'Ej. Carbovac'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dosis Aplicada</label>
              <input
                type="text"
                required
                value={formData.dosis}
                onChange={e => setFormData({ ...formData, dosis: e.target.value })}
                placeholder="Ej. 5 ml"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            {/* Responsable (Nómina o Externo) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 uppercase">Responsable / Veterinario</label>
                <button
                  type="button"
                  onClick={() => setModoResponsable(modoResponsable === 'nomina' ? 'externo' : 'nomina')}
                  className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <UserPlus size={12} /> {modoResponsable === 'nomina' ? '¿Externo?' : 'Usar nómina'}
                </button>
              </div>

              {modoResponsable === 'nomina' ? (
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <select
                    value={formData.responsable}
                    onChange={e => setFormData({ ...formData, responsable: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {empleados.map(emp => (
                      <option key={emp.idEmpleado} value={emp.idEmpleado}>
                        {emp.nombreCompleto} ({emp.puestoRelacion?.nombre || emp.puesto || 'Sin puesto'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="relative">
                  <UserPlus size={16} className="absolute left-3.5 top-3 text-emerald-600" />
                  <input
                    type="text"
                    required
                    value={formData.responsableExterno}
                    onChange={e => setFormData({ ...formData, responsableExterno: e.target.value })}
                    placeholder="Ej. Dr. Roberto Gómez"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/30 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Empleados de Apoyo</label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.ayudantes}
                  onChange={e => setFormData({ ...formData, ayudantes: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Observaciones Generales</label>
              <input
                type="text"
                value={formData.observacionesGeneral}
                onChange={e => setFormData({ ...formData, observacionesGeneral: e.target.value })}
                placeholder="Ej. Aplicación sin contratiempos..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selector condicional según el modo */}
          {modo === 'masivo' ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 size={16} className="text-emerald-600" /> Seleccionar Corral Objetivo (Grupal)
              </label>
              <select
                value={corralSeleccionado}
                onChange={e => setCorralSeleccionado(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                {corrales.map(c => (
                  <option key={c.idCorral} value={c.idCorral}>
                    {c.nombre} (Capacidad máxima: {c.capacidadMaxima})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Stethoscope size={16} className="text-purple-600" /> Seleccionar Animal Arete / Identificador (Individual)
              </label>
              <select
                value={formData.idAnimalIndividual}
                onChange={e => setFormData({ ...formData, idAnimalIndividual: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-purple-50/30"
              >
                {animales.map(a => (
                  <option key={a.idAnimal} value={a.idAnimal}>
                    Arete: {a.areteBandera} {a.nombre ? `- ${a.nombre}` : ''} ({a.estado})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tabla de Animales del Corral (Solo si es modo masivo) */}
          {modo === 'masivo' && (
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase">
                Animales en el Lote ({animalesCorral.length})
              </div>
              {animalesCorral.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No hay animales activos en este corral.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                        <th className="py-3 px-4">Arete</th>
                        <th className="py-3 px-4">Nombre</th>
                        <th className="py-3 px-4 text-center">¿Aplicar?</th>
                        <th className="py-3 px-4">Observación Individual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                      {animalesCorral.map((animal) => {
                        const isChecked = detalleAnimales[animal.idAnimal]?.aplicado ?? true;
                        return (
                          <tr key={animal.idAnimal} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">{animal.areteBandera}</td>
                            <td className="py-3 px-4 text-slate-700">{animal.nombre || 'Sin nombre'}</td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => handleCheckboxChange(animal.idAnimal, e.target.checked)}
                                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={detalleAnimales[animal.idAnimal]?.observaciones || ''}
                                onChange={e => handleObsChange(animal.idAnimal, e.target.value)}
                                placeholder="Ej. Preñada, cojera..."
                                disabled={!isChecked}
                                className={`w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                                  !isChecked ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700'
                                }`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción del modal */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> Guardar {modo === 'masivo' ? 'Campaña Grupal' : 'Tratamiento Individual'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}