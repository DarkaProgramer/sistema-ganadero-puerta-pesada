// EmpleadosView.jsx — Gestión completa de Empleados y Administradores
import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Edit3, Shield, User, Mail, Phone, Briefcase, AlertCircle } from 'lucide-react';
import EmpleadoForm from './forms/EmpleadoForm';

export default function EmpleadosView() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const obtenerEmpleados = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/empleados');
      const data = await res.json();
      if (res.ok) setEmpleados(data);
      else setError(data.error || 'Error al cargar empleados');
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const cargarDatos = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/empleados');
        const data = await res.json();
        if (isMounted) {
          if (res.ok) setEmpleados(data);
          else setError(data.error || 'Error al cargar empleados');
        }
      } catch {
        if (isMounted) setError('No se pudo conectar con el servidor.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    cargarDatos();
    return () => { isMounted = false; };
  }, []);

  const handleGuardarEmpleado = async (formData) => {
    try {
      const url = empleadoSeleccionado 
        ? `http://localhost:4000/api/empleados/${empleadoSeleccionado.idEmpleado}`
        : 'http://localhost:4000/api/empleados/registro';
      
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
        obtenerEmpleados();
        alert(empleadoSeleccionado ? 'Empleado actualizado con éxito.' : 'Empleado registrado con éxito.');
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
      const res = await fetch(`http://localhost:4000/api/empleados/${id}`, { method: 'DELETE' });
      if (res.ok) obtenerEmpleados();
      else alert('No se pudo eliminar el empleado.');
    } catch {
      alert('Error de red al eliminar.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-emerald-600" /> Gestión de Empleados y Usuarios
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra los accesos, roles y personal del Rancho Puerta Pesada.
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

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando personal...</div>
        ) : empleados.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay empleados registrados en el sistema.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Nombre Completo</th>
                  <th className="py-4 px-6">Correo Electrónico</th>
                  <th className="py-4 px-6">Puesto / Oficio</th>
                  <th className="py-4 px-6">Rol de Acceso</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {empleados.map((emp) => (
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
                        {emp.puesto || 'No asignado'}
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
                    <td className="py-4 px-6 text-right space-x-1">
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
          onSubmit={handleGuardarEmpleado} 
          onCancel={() => { setIsModalOpen(false); setEmpleadoSeleccionado(null); }} 
        />
      )}
    </div>
  );
}