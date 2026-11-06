// EmpleadosView.jsx — Actualizado con puestos dinámicos y sin errores de ESLint
import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Edit3, Shield, User, Mail, Phone, Briefcase, AlertCircle, Eye, Search } from 'lucide-react';
import EmpleadoForm from './forms/EmpleadoForm';
import EmpleadoDetalleView from './EmpleadoDetalleView';
import EstatusBadge from '../components/ui/EstatusBadge';
import { ESTATUS } from '../utils/estatusEmpleado';
import { API_URL } from '../config/api';

export default function EmpleadosView({ showToast }) {
  const [empleados, setEmpleados] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  // Tarjeta 1: filtros por estatus y ficha a detalle
  const [filtroEstatus, setFiltroEstatus] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [detalleId, setDetalleId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function cargarDatosEmpleados() {
      try {
        const [resEmp, resPuestos] = await Promise.all([
          fetch(`${API_URL}/api/empleados`),
          fetch(`${API_URL}/api/configuracion/puestos`)
        ]);
        
        const dataEmp = await resEmp.json();
        const dataPuestos = await resPuestos.json();

        if (isMounted) {
          if (resEmp.ok) setEmpleados(dataEmp);
          if (resPuestos.ok) setPuestos(dataPuestos);
        }
      } catch {
        if (isMounted) setError('No se pudo conectar con el servidor.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    cargarDatosEmpleados();

    return () => {
      isMounted = false;
    };
  }, []);

  const refrescarDatos = async () => {
    try {
      const [resEmp, resPuestos] = await Promise.all([
        fetch(`${API_URL}/api/empleados`),
        fetch(`${API_URL}/api/configuracion/puestos`)
      ]);
      if (resEmp.ok) setEmpleados(await resEmp.json());
      if (resPuestos.ok) setPuestos(await resPuestos.json());
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  const handleGuardarEmpleado = async (formData) => {
    try {
      const url = empleadoSeleccionado 
        ? `${API_URL}/api/empleados/${empleadoSeleccionado.idEmpleado}`
        : `${API_URL}/api/empleados/registro`;
      
      const method = empleadoSeleccionado ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setEmpleadoSeleccionado(null);
        await refrescarDatos();
        
        if (data.passwordTemporal) {
          alert(`✅ Empleado registrado con éxito.\n\n🔑 Contraseña temporal generada automáticamente: ${data.passwordTemporal}`);
        } else {
          alert(empleadoSeleccionado ? 'Empleado actualizado con éxito.' : 'Empleado registrado con éxito.');
        }
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch {
      alert('Error de red al procesar la solicitud.');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este empleado del sistema?')) return;
    try {
      const res = await fetch(`${API_URL}/api/empleados/${id}`, { method: 'DELETE' });
      if (res.ok) await refrescarDatos();
    } catch {
      alert('Error de red al eliminar.');
    }
  };

  const conteoEstatus = empleados.reduce((acc, e) => ({ ...acc, [e.estatus || 'Activo']: (acc[e.estatus || 'Activo'] || 0) + 1 }), {});
  const empleadosFiltrados = empleados.filter(e =>
    (filtroEstatus === 'Todos' || (e.estatus || 'Activo') === filtroEstatus) &&
    (!busqueda || `${e.nombreCompleto} ${e.correo} ${e.puestoRelacion?.nombre || ''}`.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (detalleId) {
    return (
      <EmpleadoDetalleView
        idEmpleado={detalleId}
        showToast={showToast}
        onBack={() => { setDetalleId(null); refrescarDatos(); }}
        onEditar={(emp) => { setDetalleId(null); setEmpleadoSeleccionado(emp); setIsModalOpen(true); }}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-emerald-600" /> Gestión de Empleados y Usuarios
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra los accesos, roles y personal del Rancho.
          </p>
        </div>
        <button
          onClick={() => { setEmpleadoSeleccionado(null); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition shadow-sm self-start"
        >
          <UserPlus size={18} /> Registrar Nuevo Empleado
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Filtros por estatus y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {['Todos', ...Object.keys(ESTATUS)].map(est => (
            <button key={est} onClick={() => setFiltroEstatus(est)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${filtroEstatus === est ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {est} <span className="opacity-70">({est === 'Todos' ? empleados.length : (conteoEstatus[est] || 0)})</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre, correo o puesto"
            className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-full md:w-72 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white" />
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando personal...</div>
        ) : empleadosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400">{empleados.length === 0 ? 'No hay empleados registrados en el sistema.' : 'Ningún empleado coincide con los filtros.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Nombre Completo</th>
                  <th className="py-4 px-6">Correo Electrónico</th>
                  <th className="py-4 px-6">Puesto / Oficio</th>
                  <th className="py-4 px-6">Rol de Acceso</th>
                  <th className="py-4 px-6">Estatus</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {empleadosFiltrados.map((emp) => (
                  <tr key={emp.idEmpleado} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {emp.nombreCompleto ? emp.nombreCompleto.charAt(0) : 'U'}
                        </div>
                        <div>
                          <span>{emp.nombreCompleto}</span>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone size={12} /> {emp.telefono || 'Sin teléfono'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail size={14} className="text-slate-400 flex-shrink-0" />
                        <span>{emp.correo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Briefcase size={13} className="text-slate-500" />
                        {emp.puestoRelacion?.nombre || 'No asignado'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        emp.rol === 'Administrador' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {emp.rol === 'Administrador' ? <Shield size={12} /> : <User size={12} />}
                        {emp.rol}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <EstatusBadge estatus={emp.estatus} />
                    </td>
                    <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setDetalleId(emp.idEmpleado)}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition inline-flex items-center justify-center"
                        title="Ver ficha del empleado"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => { setEmpleadoSeleccionado(emp); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center justify-center"
                        title="Editar empleado"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(emp.idEmpleado)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition inline-flex items-center justify-center"
                        title="Eliminar empleado"
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

      {isModalOpen && (
        <EmpleadoForm 
          empleadoAEditar={empleadoSeleccionado}
          puestosDisponibles={puestos}
          onSubmit={handleGuardarEmpleado} 
          onCancel={() => { setIsModalOpen(false); setEmpleadoSeleccionado(null); }} 
        />
      )}
    </div>
  );
}