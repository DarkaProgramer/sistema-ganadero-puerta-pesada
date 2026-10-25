// src/views/SaludView.jsx — Vista principal de Control Sanitario e Historial con Reporte a Detalle y Edición
import { useState, useEffect } from 'react';
import { Syringe, Plus, Trash2, Calendar, User, Building2, Package, AlertCircle, Eye, Edit3 } from 'lucide-react';
import SaludForm from './forms/SaludForm';
import { API_URL } from '../config/api';

export default function SaludView({ showToast }) {
  const [controles, setControles] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para Ver Detalle y Editar Campaña
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [eventoAEditar, setEventoAEditar] = useState(null);
  const [formDataEdicion, setFormDataEdicion] = useState({
    producto: '',
    dosis: '',
    fecha: '',
    ayudantes: '',
    observaciones: ''
  });

  const cargarDatosSalud = async () => {
    try {
      const [resSalud, resCorrales, resEmpleados, resAnimales] = await Promise.all([
        fetch(`${API_URL}/api/salud`),
        fetch(`${API_URL}/api/configuracion/corrales`),
        fetch(`${API_URL}/api/empleados`),
        fetch(`${API_URL}/api/animales`)
      ]);

      if (resSalud.ok) setControles(await resSalud.json());
      if (resCorrales.ok) setCorrales(await resCorrales.json());
      if (resEmpleados.ok) setEmpleados(await resEmpleados.json());
      if (resAnimales.ok) setAnimales(await resAnimales.json());
    } catch {
      setError('No se pudo conectar con el servidor para cargar los datos de salud.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [resSalud, resCorrales, resEmpleados, resAnimales] = await Promise.all([
          fetch(`${API_URL}/api/salud`),
          fetch(`${API_URL}/api/configuracion/corrales`),
          fetch(`${API_URL}/api/empleados`),
          fetch(`${API_URL}/api/animales`)
        ]);

        if (isMounted) {
          if (resSalud.ok) setControles(await resSalud.json());
          if (resCorrales.ok) setCorrales(await resCorrales.json());
          if (resEmpleados.ok) setEmpleados(await resEmpleados.json());
          if (resAnimales.ok) setAnimales(await resAnimales.json());
        }
      } catch {
        if (isMounted) setError('Error al cargar la información.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleRegistrarControl = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/api/salud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        await cargarDatosSalud();
        if (showToast) {
          showToast({ message: 'Campaña sanitaria registrada con éxito.', type: 'success' });
        } else {
          alert('Campaña sanitaria registrada con éxito.');
        }
      } else {
        alert(data.error || 'Error al registrar el control sanitario');
      }
    } catch {
      alert('Error de red al procesar la solicitud.');
    }
  };

  const handleActualizarControl = async (e) => {
    e.preventDefault();
    if (!eventoAEditar) return;

    try {
      const res = await fetch(`${API_URL}/api/salud/${eventoAEditar.idControl}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataEdicion)
      });

      if (res.ok) {
        setModalEditarOpen(false);
        setEventoAEditar(null);
        await cargarDatosSalud();
        if (showToast) {
          showToast({ message: 'Registro sanitario actualizado con éxito.', type: 'success' });
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar el registro sanitario.');
      }
    } catch {
      alert('Error de red al actualizar.');
    }
  };

  const handleEliminar = async (idControl) => {
    if (!confirm('¿Estás seguro de eliminar este registro sanitario?')) return;
    try {
      const res = await fetch(`${API_URL}/api/salud/${idControl}`, { method: 'DELETE' });
      if (res.ok) {
        await cargarDatosSalud();
        if (showToast) showToast({ message: 'Registro eliminado.', type: 'info' });
      } else {
        alert('No se pudo eliminar el registro.');
      }
    } catch {
      alert('Error de red al eliminar.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Syringe className="text-emerald-600" /> Control Sanitario y Vacunación
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Historial de campañas masivas por corral y tratamientos clínicos aplicados.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition shadow-sm self-start"
        >
          <Plus size={18} /> Registrar Campaña o Tratamiento
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Tabla de Historial */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando registros sanitarios...</div>
        ) : controles.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay registros de salud en el sistema.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Fecha / Tipo</th>
                  <th className="py-4 px-6">Corral Tratado</th>
                  <th className="py-4 px-6">Producto / Dosis</th>
                  <th className="py-4 px-6">Responsable</th>
                  <th className="py-4 px-6">Observaciones</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {controles.map((item) => (
                  <tr key={item.idControl} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-600 flex-shrink-0" />
                        <span>{new Date(item.fecha).toLocaleDateString()}</span>
                      </div>
                      <span className="inline-block mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Building2 size={13} className="text-slate-500" />
                        {item.corral?.nombre || 'General'} ({item.tratamientos?.length || 0} animales)
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Package size={14} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <span>{item.producto}</span>
                          {item.dosis && <span className="block text-xs text-slate-400">Dosis: {item.dosis}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <User size={13} className="text-slate-400" />
                        <span>{item.empleado?.nombreCompleto || 'Responsable N/D'}</span>
                      </div>
                      {item.ayudantes && (
                        <span className="block text-[11px] text-slate-400 mt-0.5">Apoyo: {item.ayudantes}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                      {item.observaciones || 'Sin observaciones'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEventoSeleccionado(item);
                          setModalDetalleOpen(true);
                        }}
                        className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl border border-slate-200 transition inline-flex items-center justify-center"
                        title="Ver reporte médico a detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEventoAEditar(item);
                          setFormDataEdicion({
                            producto: item.producto || '',
                            dosis: item.dosis || '',
                            fecha: item.fecha ? item.fecha.split('T')[0] : '',
                            ayudantes: item.ayudantes || '',
                            observaciones: item.observaciones || ''
                          });
                          setModalEditarOpen(true);
                        }}
                        className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-xl border border-slate-200 transition inline-flex items-center justify-center"
                        title="Editar registro"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(item.idControl)}
                        className="p-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl border border-slate-200 transition inline-flex items-center justify-center"
                        title="Eliminar registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Ver Reporte Médico a Detalle */}
      {modalDetalleOpen && eventoSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Syringe className="text-emerald-600" /> Reporte Médico: {eventoSeleccionado.tipo}
              </h3>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                {eventoSeleccionado.tratamientos?.length || 0} animales evaluados
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl text-sm border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">Producto</span>
                <strong className="text-slate-800">{eventoSeleccionado.producto}</strong>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">Dosis</span>
                <strong className="text-slate-800">{eventoSeleccionado.dosis || 'N/D'}</strong>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">Fecha</span>
                <strong className="text-slate-800">{new Date(eventoSeleccionado.fecha).toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">Responsable</span>
                <strong className="text-slate-800">{eventoSeleccionado.empleado?.nombreCompleto || 'N/D'}</strong>
              </div>
            </div>

            {eventoSeleccionado.ayudantes && (
              <div className="text-xs bg-slate-100 p-3 rounded-xl text-slate-700">
                <strong>Empleados de apoyo:</strong> {eventoSeleccionado.ayudantes}
              </div>
            )}

            {eventoSeleccionado.observaciones && (
              <div className="text-xs bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl text-slate-700">
                <strong>Observaciones Generales:</strong> {eventoSeleccionado.observaciones}
              </div>
            )}

            <div className="flex-1 overflow-y-auto max-h-60 border border-slate-100 rounded-2xl p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase bg-slate-50/50">
                    <th className="py-2.5 px-3">Arete Animal</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Observación Individual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {eventoSeleccionado.tratamientos?.map(t => (
                    <tr key={t.idTratamiento} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{t.animal?.areteBandera || 'N/D'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          t.estado === 'Aplicado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {t.estado}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">{t.observaciones || 'Sin observaciones'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalDetalleOpen(false)}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition"
              >
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Registro Sanitario */}
      {modalEditarOpen && eventoAEditar && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="text-amber-600" /> Editar Registro: {eventoAEditar.tipo}
              </h3>
            </div>

            <form onSubmit={handleActualizarControl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Producto / Medicamento</label>
                <input
                  type="text"
                  required
                  value={formDataEdicion.producto}
                  onChange={e => setFormDataEdicion({ ...formDataEdicion, producto: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dosis</label>
                <input
                  type="text"
                  required
                  value={formDataEdicion.dosis}
                  onChange={e => setFormDataEdicion({ ...formDataEdicion, dosis: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={formDataEdicion.fecha}
                  onChange={e => setFormDataEdicion({ ...formDataEdicion, fecha: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Empleados de Apoyo</label>
                <input
                  type="text"
                  value={formDataEdicion.ayudantes}
                  onChange={e => setFormDataEdicion({ ...formDataEdicion, ayudantes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Observaciones Generales</label>
                <input
                  type="text"
                  value={formDataEdicion.observaciones}
                  onChange={e => setFormDataEdicion({ ...formDataEdicion, observaciones: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditarOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal del Formulario Modular por Lote */}
      {isModalOpen && (
        <SaludForm 
          corrales={corrales}
          empleados={empleados}
          animales={animales}
          onSubmit={handleRegistrarControl}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}