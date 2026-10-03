// GanadoView.jsx — Gestión de ganado conectada al Backend, Ficha de Detalle y Báscula Masiva

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Beef, Trash2, Edit3, Tag, Scale, Eye, Building2 } from 'lucide-react';
import Badge from '../components/ui/Badge';
import AnimalForm from './forms/AnimalForm';
import AnimalDetalleView from './AnimalDetalleView';
import PesajeMasivoView from './PesajeMasivoView';

const ESTADOS = ['Vivo', 'Vendido', 'Muerto'];

export default function GanadoView({ showToast }) {
  // Control de vistas principales dentro del módulo: 'listado', 'detalle', 'pesaje-masivo'
  const [vistaActual, setVistaActual] = useState('listado');
  const [animalSeleccionadoId, setAnimalSeleccionadoId] = useState(null);

  const [animales, setAnimales] = useState([]);
  const [corrales, setCorrales] = useState([]);
  const [tiposAnimal, setTiposAnimal] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCorral, setFiltroCorral] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // Nuevo filtro por tipo de ganado

  // Modal de Crear / Editar Animal
  const [modalOpen, setModalOpen] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);

  // ── Cargar datos del backend de forma limpia ────────────────
  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const [resAnimales, resCatalogos] = await Promise.all([
          fetch('http://localhost:4000/api/animales'),
          fetch('http://localhost:4000/api/animales/catalogos')
        ]);

        const dataAnimales = await resAnimales.json();
        const dataCatalogos = await resCatalogos.json();

        if (isMounted) {
          if (resAnimales.ok) setAnimales(dataAnimales);
          if (resCatalogos.ok) {
            setCorrales(dataCatalogos.corrales || []);
            setTiposAnimal(dataCatalogos.tiposAnimal || []);
          }
        }
      } catch (err) {
        console.error('Error al sincronizar con el servidor:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarDatos();

    return () => { isMounted = false; };
  }, []);

  const recargarDatos = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/animales');
      const data = await res.json();
      if (res.ok) setAnimales(data);
    } catch (err) {
      console.error('Error al recargar:', err);
    }
  };

  // ── Filtrado ──────────────────────────────────────────────
  const filtrados = animales.filter(a => {
    const matchEstado = filtroEstado === 'todos' || a.estado.toLowerCase() === filtroEstado.toLowerCase();
    const matchCorral = filtroCorral === 'todos' || String(a.idCorral) === String(filtroCorral);
    const matchTipo = filtroTipo === 'todos' || String(a.idTipoAnimal) === String(filtroTipo);
    const matchBusq = busqueda === '' || 
      a.areteBandera.toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.nombre && a.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    return matchEstado && matchCorral && matchTipo && matchBusq;
  });

  const totalActivos = animales.filter(a => a.estado.toLowerCase() === 'vivo').length;
  const totalVendidos = animales.filter(a => a.estado.toLowerCase() === 'vendido').length;
  const totalMuertos = animales.filter(a => a.estado.toLowerCase() === 'muerto').length;

  // ── Guardar (Crear o Actualizar) con validación de límite de corral y Alerta de Endogamia ──
  const handleGuardar = async (formData) => {
    try {
      const url = animalSeleccionado 
        ? `http://localhost:4000/api/animales/${animalSeleccionado.idAnimal}`
        : 'http://localhost:4000/api/animales/registro';
      
      const method = animalSeleccionado ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setModalOpen(false);
        setAnimalSeleccionado(null);
        recargarDatos();

        // Si el backend detectó que el padre o madre están en el mismo corral, lanzamos alerta visual
        if (datos.warning) {
          alert(datos.warning);
        }

        showToast({ 
          message: animalSeleccionado ? 'Animal actualizado correctamente.' : (datos.message || 'Animal registrado con éxito.'), 
          type: 'success' 
        });
      } else {
        alert(datos.error || 'Ocurrió un error al guardar.');
      }
    } catch {
      alert('Error de red al conectar con el servidor.');
    }
  };

  // ── Eliminar animal ───────────────────────────────────────
  const handleEliminar = async (id, arete) => {
    if (!confirm(`¿Estás seguro de eliminar el registro del animal con arete ${arete}?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/animales/${id}`, { method: 'DELETE' });
      if (res.ok) {
        recargarDatos();
        showToast({ message: `Animal ${arete} eliminado del sistema.`, type: 'info' });
      } else {
        alert('No se pudo eliminar el animal.');
      }
    } catch {
      alert('Error de red al intentar eliminar.');
    }
  };

  const calcEdad = (fechaNac) => {
    if (!fechaNac) return 'N/D';
    const hoy = new Date();
    const nac = new Date(fechaNac);
    const meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
    if (meses < 12) return `${meses} meses`;
    return `${Math.floor(meses / 12)} años`;
  };

  // 1. Renderizar vista de Detalle Individual (Trazabilidad y Pesos)
  if (vistaActual === 'detalle') {
    return (
      <AnimalDetalleView
        animalId={animalSeleccionadoId}
        onBack={() => { setVistaActual('listado'); setAnimalSeleccionadoId(null); }}
        showToast={showToast}
      />
    );
  }

  // 2. Renderizar vista de Pesaje Masivo por Lote
  if (vistaActual === 'pesaje-masivo') {
    return (
      <PesajeMasivoView
        onBack={() => { setVistaActual('listado'); recargarDatos(); }}
        showToast={showToast}
      />
    );
  }

  // 3. Vista Principal de Listado
  return (
    <div className="space-y-5">

      {/* ── Chips de resumen ─────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Activos (Vivos)', count: totalActivos, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Vendidos', count: totalVendidos, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          { label: 'Muertos / Baja', count: totalMuertos, color: 'text-red-700 bg-red-50 border-red-200' },
          { label: 'Total', count: animales.length, color: 'text-slate-700 bg-white border-slate-200 font-semibold' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`px-4 py-2 rounded-lg border text-sm ${color}`}>
            <span className="font-bold text-base mr-1">{count}</span>{label}
          </div>
        ))}
      </div>

      {/* ── Barra de herramientas ────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-4 border-b border-slate-100">
          {/* Búsqueda */}
          <div className="relative w-full lg:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por arete o nombre..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filtros y botones de acción */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
            {/* Filtro estado */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 bg-white">
              <Filter size={13} className="text-slate-400" />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="todos">Todos los estados</option>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Filtro corral */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 bg-white">
              <Building2 size={13} className="text-slate-400" />
              <select
                value={filtroCorral}
                onChange={e => setFiltroCorral(e.target.value)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="todos">Todos los corrales</option>
                {corrales.map(c => <option key={c.idCorral} value={c.idCorral}>{c.nombre}</option>)}
              </select>
            </div>

            {/* Filtro tipo de ganado */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 bg-white">
              <Beef size={13} className="text-slate-400" />
              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="todos">Todos los tipos</option>
                {tiposAnimal.map(t => <option key={t.idTipoAnimal} value={t.idTipoAnimal}>{t.nombre}</option>)}
              </select>
            </div>

            {/* Botón Báscula Masiva */}
            <button
              onClick={() => setVistaActual('pesaje-masivo')}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-sm font-medium px-3.5 py-2 rounded-lg transition border border-slate-200"
              title="Registrar pesaje masivo por lote"
            >
              <Scale size={15} />
              Báscula Masiva
            </button>

            {/* Botón nuevo animal */}
            <button
              onClick={() => { setAnimalSeleccionado(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={15} />
              Registrar animal
            </button>
          </div>
        </div>

        {/* ── Tabla ──────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                {['Arete Bandera', 'Nombre', 'Tipo / Raza', 'Género', 'Edad', 'Corral', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                    Cargando inventario de ganado...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                    <Beef size={32} className="mx-auto mb-2 opacity-30" />
                    No se encontraron animales con los filtros aplicados.
                  </td>
                </tr>
              ) : filtrados.map(a => (
                <tr key={a.idAnimal} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-emerald-500" />
                      <div>
                        {a.areteBandera}
                        {a.areteBoton && <span className="block text-[10px] text-slate-400 font-normal">Botón: {a.areteBoton}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{a.nombre || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-semibold text-slate-800">{a.tipoAnimal?.nombre}</span>
                    <span className="block text-xs text-slate-400">
                      {a.raza?.nombre} {a.detalleMestizo ? `(${a.detalleMestizo})` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.genero}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{calcEdad(a.fechaNacimiento)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {a.corral?.nombre || 'Sin corral'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge estado={a.estado.toLowerCase()} /></td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    {/* Botón Ver Ficha e Historiales */}
                    <button
                      onClick={() => { setAnimalSeleccionadoId(a.idAnimal); setVistaActual('detalle'); }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center"
                      title="Ver Ficha y Pesajes"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => { setAnimalSeleccionado(a); setModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Editar datos del animal"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleEliminar(a.idAnimal, a.areteBandera)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar animal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
          Mostrando {filtrados.length} de {animales.length} animales
        </div>
      </div>

      {/* ── Modal Modular: Registrar / Editar Animal ─────── */}
      {modalOpen && (
        <AnimalForm 
          animalAEditar={animalSeleccionado}
          corrales={corrales}
          tiposAnimal={tiposAnimal}
          animalesLista={animales}
          onSubmit={handleGuardar}
          onCancel={() => { setModalOpen(false); setAnimalSeleccionado(null); }}
        />
      )}
    </div>
  );
}