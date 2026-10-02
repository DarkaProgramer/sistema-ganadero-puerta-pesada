// ConfiguracionView.jsx — Panel visual exclusivo para Administradores
import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Building2, Beef, Edit3, Plus } from 'lucide-react';
import { GeneralConfigForm, CorralForm, TipoAnimalForm } from './forms/ConfiguracionForm';

export default function ConfiguracionView({ usuario, showToast }) {
  const [config, setConfig] = useState(null);
  const [corrales, setCorrales] = useState([]);
  const [tiposAnimal, setTiposAnimal] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para controlar los modales
  const [modalGeneralOpen, setModalGeneralOpen] = useState(false);
  const [modalCorralOpen, setModalCorralOpen] = useState(false);
  const [modalTipoOpen, setModalTipoOpen] = useState(false);
  
  // Estado para saber qué corral se está editando (si es null, es nuevo)
  const [corralAEditar, setCorralAEditar] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function cargarDatos() {
      try {
        const [resConf, resCorrales, resTipos] = await Promise.all([
          fetch('http://localhost:4000/api/configuracion'),
          fetch('http://localhost:4000/api/configuracion/corrales'),
          fetch('http://localhost:4000/api/configuracion/tipos-animal')
        ]);

        const dataConf = await resConf.json();
        const dataCorrales = await resCorrales.json();
        const dataTipos = await resTipos.json();

        if (isMounted) {
          if (resConf.ok) setConfig(dataConf);
          if (resCorrales.ok) setCorrales(dataCorrales);
          if (resTipos.ok) setTiposAnimal(dataTipos);
        }
      } catch (err) {
        console.error('Error al cargar configuración:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const cargarDatosRefresco = async () => {
    try {
      const [resConf, resCorrales, resTipos] = await Promise.all([
        fetch('http://localhost:4000/api/configuracion'),
        fetch('http://localhost:4000/api/configuracion/corrales'),
        fetch('http://localhost:4000/api/configuracion/tipos-animal')
      ]);

      if (resConf.ok) setConfig(await resConf.json());
      if (resCorrales.ok) setCorrales(await resCorrales.json());
      if (resTipos.ok) setTiposAnimal(await resTipos.json());
    } catch (err) {
      console.error('Error al refrescar datos:', err);
    }
  };

  // Validación estricta de rol Administrador
  if (usuario?.rol !== 'administrador') {
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
        showToast({ message: corralAEditar ? 'Corral actualizado con éxito.' : 'Corral registrado con éxito.', type: 'success' });
      } else {
        alert('Error al guardar el corral.');
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
        showToast({ message: 'Tipo de ganado registrado con éxito.', type: 'success' });
      } else {
        alert('Error al crear tipo.');
      }
    } catch {
      alert('Error de red.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Cargando panel visual...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabecera visual */}
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

      {/* Secciones de Corrales y Tipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Corrales */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-emerald-600" /> Corrales ({corrales.length})
              </h3>
              <button
                onClick={() => { setCorralAEditar(null); setModalCorralOpen(true); }}
                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1 text-xs font-semibold px-3"
                title="Añadir corral"
              >
                <Plus size={16} /> Nuevo
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {corrales.map(c => (
                <div key={c.idCorral} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-2xl text-sm border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 block">{c.nombre}</span>
                    <span className="text-xs text-slate-400">Capacidad máxima: <strong>{c.capacidadMaxima}</strong></span>
                  </div>
                  <button
                    onClick={() => { setCorralAEditar(c); setModalCorralOpen(true); }}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl border border-slate-200/60 transition shadow-sm"
                    title="Editar corral"
                  >
                    <Edit3 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tipos de Ganado */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Beef size={18} className="text-emerald-600" /> Tipos de Ganado ({tiposAnimal.length})
              </h3>
              <button
                onClick={() => setModalTipoOpen(true)}
                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1 text-xs font-semibold px-3"
                title="Añadir tipo de ganado"
              >
                <Plus size={16} /> Nuevo
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {tiposAnimal.map(t => (
                <div key={t.idTipoAnimal} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-2xl text-sm border border-slate-100">
                  <span className="font-semibold text-slate-800">{t.nombre}</span>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    Activo
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {modalGeneralOpen && (
        <GeneralConfigForm
          configActual={config}
          onSubmit={handleGuardarGeneral}
          onCancel={() => setModalGeneralOpen(false)}
        />
      )}

      {modalCorralOpen && (
        <CorralForm
          corralAEditar={corralAEditar}
          onSubmit={handleGuardarCorral}
          onCancel={() => { setModalCorralOpen(false); setCorralAEditar(null); }}
        />
      )}

      {modalTipoOpen && (
        <TipoAnimalForm
          onSubmit={handleCrearTipo}
          onCancel={() => setModalTipoOpen(false)}
        />
      )}
    </div>
  );
}