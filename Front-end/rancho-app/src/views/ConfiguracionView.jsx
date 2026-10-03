// ConfiguracionView.jsx — Panel visual exclusivo para Administradores
import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Building2, Beef, Edit3, Plus, Briefcase, Power } from 'lucide-react';
import { GeneralConfigForm, CorralForm, TipoAnimalForm, PuestoForm } from './forms/ConfiguracionForm';

export default function ConfiguracionView({ usuario, showToast }) {
  const [config, setConfig] = useState(null);
  const [corrales, setCorrales] = useState([]);
  const [tiposAnimal, setTiposAnimal] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para controlar los modales
  const [modalGeneralOpen, setModalGeneralOpen] = useState(false);
  const [modalCorralOpen, setModalCorralOpen] = useState(false);
  const [modalTipoOpen, setModalTipoOpen] = useState(false);
  const [modalPuestoOpen, setModalPuestoOpen] = useState(false);
  
  const [corralAEditar, setCorralAEditar] = useState(null);
  const [puestoAEditar, setPuestoAEditar] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function cargarDatos() {
      try {
        const [resConf, resCorrales, resTipos, resPuestos] = await Promise.all([
          fetch('http://localhost:4000/api/configuracion'),
          fetch('http://localhost:4000/api/configuracion/corrales'),
          fetch('http://localhost:4000/api/configuracion/tipos-animal'),
          fetch('http://localhost:4000/api/configuracion/puestos')
        ]);

        const dataConf = await resConf.json();
        const dataCorrales = await resCorrales.json();
        const dataTipos = await resTipos.json();
        const dataPuestos = await resPuestos.json();

        if (isMounted) {
          if (resConf.ok) setConfig(dataConf);
          if (resCorrales.ok) setCorrales(dataCorrales);
          if (resTipos.ok) setTiposAnimal(dataTipos);
          if (resPuestos.ok) setPuestos(dataPuestos);
        }
      } catch (err) {
        console.error('Error al cargar configuración:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const cargarDatosRefresco = async () => {
    try {
      const [resConf, resCorrales, resTipos, resPuestos] = await Promise.all([
        fetch('http://localhost:4000/api/configuracion'),
        fetch('http://localhost:4000/api/configuracion/corrales'),
        fetch('http://localhost:4000/api/configuracion/tipos-animal'),
        fetch('http://localhost:4000/api/configuracion/puestos')
      ]);

      if (resConf.ok) setConfig(await resConf.json());
      if (resCorrales.ok) setCorrales(await resCorrales.json());
      if (resTipos.ok) setTiposAnimal(await resTipos.json());
      if (resPuestos.ok) setPuestos(await resPuestos.json());
    } catch (err) {
      console.error('Error al refrescar datos:', err);
    }
  };

  // Validación estricta de rol Administrador
  if (usuario?.rol !== 'Administrador' && usuario?.rol !== 'administrador') {
    return (
      <div className="p-12 max-w-xl mx-auto text-center bg-white rounded-3xl shadow-sm border border-slate-100 mt-12">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mt-2">
          La sección de personalización del rancho está disponible únicamente para administradores.
        </p>
      </div>
    );
  }

  const handleGuardarGeneral = async (formData) => {
    try {
      const res = await fetch('http://localhost:4000/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setModalGeneralOpen(false);
        await cargarDatosRefresco();
        showToast({ message: 'Configuración actualizada con éxito.', type: 'success' });
      } else {
        alert('Error al guardar.');
      }
    } catch {
      alert('Error de red.');
    }
  };

  const handleGuardarCorral = async (formData) => {
    try {
      const url = corralAEditar 
        ? `http://localhost:4000/api/configuracion/corrales/${corralAEditar.idCorral}`
        : 'http://localhost:4000/api/configuracion/corrales';
      const method = corralAEditar ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, capacidadMaxima: Number(formData.capacidadMaxima) })
      });

      if (res.ok) {
        setModalCorralOpen(false);
        setCorralAEditar(null);
        await cargarDatosRefresco();
        showToast({ message: corralAEditar ? 'Corral actualizado.' : 'Corral registrado.', type: 'success' });
      }
    } catch {
      alert('Error de red.');
    }
  };

  const handleCrearTipo = async (formData) => {
    try {
      const res = await fetch('http://localhost:4000/api/configuracion/tipos-animal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setModalTipoOpen(false);
        await cargarDatosRefresco();
        showToast({ message: 'Tipo de ganado registrado.', type: 'success' });
      }
    } catch {
      alert('Error de red.');
    }
  };

  // Alternar Estado Activo / Inactivo de Tipo de Ganado
  const handleToggleEstadoTipo = async (tipo) => {
    try {
      const res = await fetch(`http://localhost:4000/api/configuracion/tipos-animal/${tipo.idTipoAnimal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !tipo.activo })
      });
      if (res.ok) {
        await cargarDatosRefresco();
        showToast({ message: `Estado de ${tipo.nombre} actualizado.`, type: 'info' });
      }
    } catch {
      alert('Error al cambiar estado.');
    }
  };

  const handleGuardarPuesto = async (formData) => {
    try {
      const url = puestoAEditar 
        ? `http://localhost:4000/api/configuracion/puestos/${puestoAEditar.idPuesto}`
        : 'http://localhost:4000/api/configuracion/puestos';
      const method = puestoAEditar ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setModalPuestoOpen(false);
        setPuestoAEditar(null);
        await cargarDatosRefresco();
        showToast({ message: puestoAEditar ? 'Puesto actualizado.' : 'Puesto creado.', type: 'success' });
      }
    } catch {
      alert('Error de red.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Cargando panel visual...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="text-emerald-600" /> Configuración del Rancho
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visualiza y administra los parámetros operativos y de identidad corporativa.
          </p>
        </div>
      </div>

      {/* Tarjeta de Identidad Visual */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
            <img 
              src={config?.logoUrl || '/logo-Rancho.png'} 
              alt="Logo Rancho" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/80?text=PP'; }}
            />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Rancho Activo</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">{config?.nombreRancho}</h2>
            <p className="text-slate-400 text-xs mt-1">
              Moneda: <strong className="text-slate-600">{config?.moneda}</strong> | Unidad de Peso: <strong className="text-slate-600">{config?.unidadPeso}</strong>
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalGeneralOpen(true)}
          className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition"
        >
          <Edit3 size={16} /> Editar Identidad
        </button>
      </div>

      {/* Secciones de Corrales, Tipos de Ganado y Puestos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Corrales */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-emerald-600" /> Corrales
              </h3>
              <button
                onClick={() => { setCorralAEditar(null); setModalCorralOpen(true); }}
                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1 text-xs font-semibold px-3"
              >
                <Plus size={16} /> Nuevo
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {corrales.map(c => (
                <div key={c.idCorral} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-sm border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 block">{c.nombre}</span>
                    <span className="text-xs text-slate-400">Máx: {c.capacidadMaxima}</span>
                  </div>
                  <button
                    onClick={() => { setCorralAEditar(c); setModalCorralOpen(true); }}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-600 rounded-xl border border-slate-200 transition"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tipos de Ganado (Sin botón de Nuevo) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Beef size={18} className="text-emerald-600" /> Tipos de Ganado
              </h3>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {tiposAnimal.map(t => (
                <div key={t.idTipoAnimal} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-sm border border-slate-100">
                  <span className="font-semibold text-slate-800">{t.nombre}</span>
                  <button
                    onClick={() => handleToggleEstadoTipo(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      t.activo 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    }`}
                    title="Clic para cambiar estado"
                  >
                    <Power size={12} /> {t.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Puestos de Empleados */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={18} className="text-emerald-600" /> Puestos
              </h3>
              <button
                onClick={() => { setPuestoAEditar(null); setModalPuestoOpen(true); }}
                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1 text-xs font-semibold px-3"
              >
                <Plus size={16} /> Nuevo
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {puestos.map(p => (
                <div key={p.idPuesto} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-sm border border-slate-100">
                  <span className="font-semibold text-slate-800">{p.nombre}</span>
                  <button
                    onClick={() => { setPuestoAEditar(p); setModalPuestoOpen(true); }}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-600 rounded-xl border border-slate-200 transition"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modales */}
      {modalGeneralOpen && <GeneralConfigForm configActual={config} onSubmit={handleGuardarGeneral} onCancel={() => setModalGeneralOpen(false)} />}
      {modalCorralOpen && <CorralForm corralAEditar={corralAEditar} onSubmit={handleGuardarCorral} onCancel={() => { setModalCorralOpen(false); setCorralAEditar(null); }} />}
      {modalTipoOpen && <TipoAnimalForm onSubmit={handleCrearTipo} onCancel={() => setModalTipoOpen(false)} />}
      {modalPuestoOpen && <PuestoForm puestoAEditar={puestoAEditar} onSubmit={handleGuardarPuesto} onCancel={() => { setModalPuestoOpen(false); setPuestoAEditar(null); }} />}
    </div>
  );
}