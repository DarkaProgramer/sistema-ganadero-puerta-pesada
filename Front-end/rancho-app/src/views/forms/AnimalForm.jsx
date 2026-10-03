// src/views/forms/AnimalForm.jsx — Formulario modular con scroll interno y título estático natural
import { useState } from 'react';
import { NOMBRES_MACHOS, NOMBRES_HEMBRAS, ESTADOS, GENEROS } from '../../data/nombresGanado';

const ORIGENES = ['Nacimiento', 'Compra'];

export default function AnimalForm({ animalAEditar, corrales, tiposAnimal, animalesLista = [], onSubmit, onCancel }) {
  
  // Valores iniciales seguros
  const tipoInicial = animalAEditar?.idTipoAnimal || tiposAnimal[0]?.idTipoAnimal || '';
  const especieInicial = tiposAnimal.find(t => Number(t.idTipoAnimal) === Number(tipoInicial));
  const razasIniciales = especieInicial?.razas || [];
  const razaInicial = animalAEditar?.idRaza || razasIniciales[0]?.idRaza || '';

  const [form, setForm] = useState({
    areteBandera: animalAEditar?.areteBandera || '',
    areteBoton: animalAEditar?.areteBoton || '',
    nombre: animalAEditar?.nombre || '',
    tipoNombre: animalAEditar?.nombre ? 'manual' : 'aleatorio',
    genero: animalAEditar?.genero || GENEROS[0],
    idTipoAnimal: tipoInicial,
    idRaza: razaInicial,
    detalleMestizo: animalAEditar?.detalleMestizo || '',
    idCorral: animalAEditar?.idCorral || corrales[0]?.idCorral || '',
    estado: animalAEditar?.estado || 'Vivo',
    origen: animalAEditar?.origen || 'Nacimiento',
    idPadre: animalAEditar?.idPadre || '',
    idMadre: animalAEditar?.idMadre || '',
    fechaNacimiento: animalAEditar?.fechaNacimiento ? animalAEditar.fechaNacimiento.split('T')[0] : '',
    fechaIngreso: animalAEditar?.fechaIngreso ? animalAEditar.fechaIngreso.split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');

  // Valores derivados directamente en cada render
  const especieSeleccionada = tiposAnimal.find(t => Number(t.idTipoAnimal) === Number(form.idTipoAnimal));
  const razasDisponibles = especieSeleccionada?.razas || [];
  
  const razaSeleccionada = razasDisponibles.find(r => Number(r.idRaza) === Number(form.idRaza));
  const esMestizo = razaSeleccionada?.nombre?.toLowerCase().includes('mestizo');

  // Filtrar posibles padres (machos) y madres (hembras) de la lista general del rancho
  const posiblesPadres = animalesLista.filter(a => a.genero === 'Macho' && a.idAnimal !== animalAEditar?.idAnimal);
  const posiblesMadres = animalesLista.filter(a => a.genero === 'Hembra' && a.idAnimal !== animalAEditar?.idAnimal);

  const handleTipoAnimalChange = (e) => {
    const nuevoTipoId = e.target.value;
    const nuevaEspecie = tiposAnimal.find(t => Number(t.idTipoAnimal) === Number(nuevoTipoId));
    const primeraRaza = nuevaEspecie?.razas?.[0]?.idRaza || '';

    setForm(f => ({
      ...f,
      idTipoAnimal: nuevoTipoId,
      idRaza: primeraRaza,
      detalleMestizo: ''
    }));
  };

  const handleRazaChange = (e) => {
    const nuevaRazaId = e.target.value;
    const razaObj = razasDisponibles.find(r => Number(r.idRaza) === Number(nuevaRazaId));
    const esCruza = razaObj?.nombre?.toLowerCase().includes('mestizo');

    setForm(f => ({
      ...f,
      idRaza: nuevaRazaId,
      detalleMestizo: esCruza ? f.detalleMestizo : ''
    }));
  };

  const generarNombreAleatorio = (generoActual) => {
    const lista = generoActual === 'Macho' ? NOMBRES_MACHOS : NOMBRES_HEMBRAS;
    const aleatorio = lista[Math.floor(Math.random() * lista.length)];
    setForm(f => ({ ...f, nombre: aleatorio }));
  };

  const handleGeneroChange = (nuevoGenero) => {
    setForm(f => {
      const actualiza = { ...f, genero: nuevoGenero };
      if (f.tipoNombre === 'aleatorio') {
        const lista = nuevoGenero === 'Macho' ? NOMBRES_MACHOS : NOMBRES_HEMBRAS;
        actualiza.nombre = lista[Math.floor(Math.random() * lista.length)];
      }
      return actualiza;
    });
  };

  const handleTipoNombreChange = (tipo) => {
    setForm(f => {
      if (tipo === 'aleatorio') {
        const lista = f.genero === 'Macho' ? NOMBRES_MACHOS : NOMBRES_HEMBRAS;
        const aleatorio = lista[Math.floor(Math.random() * lista.length)];
        return { ...f, tipoNombre: tipo, nombre: aleatorio };
      } else {
        return { ...f, tipoNombre: tipo, nombre: '' };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.areteBandera || !form.idCorral || !form.idTipoAnimal || !form.idRaza || !form.origen) {
      setError('El arete, corral, tipo de animal, raza y origen son obligatorios.');
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Contenedor con altura máxima y scroll interno vertical */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Título normal integrado arriba sin ser sticky */}
        <h3 className="text-xl font-bold text-slate-800 mb-6">
          {animalAEditar ? 'Editar Información del Animal' : 'Registrar Nuevo Animal'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Arete Bandera <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.areteBandera}
                onChange={e => setForm(f => ({ ...f, areteBandera: e.target.value }))}
                placeholder="Ej: MX-12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Arete Botón</label>
              <input
                type="text"
                value={form.areteBoton}
                onChange={e => setForm(f => ({ ...f, areteBoton: e.target.value }))}
                placeholder="Ej: BT-987"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selector de Género */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Género</label>
            <div className="grid grid-cols-2 gap-2">
              {GENEROS.map(g => (
                <button
                  key={g} type="button"
                  onClick={() => handleGeneroChange(g)}
                  className={`py-2 text-sm rounded-xl border font-medium transition-all ${
                    form.genero === g
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-400 bg-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Origen */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Origen del Animal</label>
            <div className="grid grid-cols-2 gap-2">
              {ORIGENES.map(o => (
                <button
                  key={o} type="button"
                  onClick={() => setForm(f => ({ ...f, origen: o, idPadre: o === 'Compra' ? '' : f.idPadre, idMadre: o === 'Compra' ? '' : f.idMadre }))}
                  className={`py-2 text-sm rounded-xl border font-medium transition-all ${
                    form.origen === o
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-400 bg-white'
                  }`}
                >
                  {o === 'Nacimiento' ? '🌱 Nacimiento en Rancho' : '🏷️ Compra Externa'}
                </button>
              ))}
            </div>
          </div>

          {/* Genética condicional solo si es Nacimiento */}
          {form.origen === 'Nacimiento' && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wide">
                🧬 Línea Genética (Opcional - Si no hay registro, dejar en blanco)
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Padre (Semental)</label>
                  <select
                    value={form.idPadre}
                    onChange={e => setForm(f => ({ ...f, idPadre: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Desconocido / No registrado --</option>
                    {posiblesPadres.map(p => (
                      <option key={p.idAnimal} value={p.idAnimal}>
                        {p.areteBandera} {p.nombre ? `(${p.nombre})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Madre</label>
                  <select
                    value={form.idMadre}
                    onChange={e => setForm(f => ({ ...f, idMadre: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Desconocido / No registrado --</option>
                    {posiblesMadres.map(m => (
                      <option key={m.idAnimal} value={m.idAnimal}>
                        {m.areteBandera} {m.nombre ? `(${m.nombre})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Opción de Nombre */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nombre del Animal</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTipoNombreChange('aleatorio')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    form.tipoNombre === 'aleatorio' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  🎲 Aleatorio
                </button>
                <button
                  type="button"
                  onClick={() => handleTipoNombreChange('manual')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    form.tipoNombre === 'manual' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  ✏️️ Manual
                </button>
              </div>
            </div>

            {form.tipoNombre === 'aleatorio' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={form.nombre}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white font-medium text-emerald-800"
                />
                <button
                  type="button"
                  onClick={() => generarNombreAleatorio(form.genero)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition whitespace-nowrap"
                >
                  🔄 Cambiar
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Escribe el nombre del animal..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            )}
          </div>

          {/* Tipo de Animal y Corral */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Tipo de Animal</label>
              <select
                value={form.idTipoAnimal}
                onChange={handleTipoAnimalChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {tiposAnimal.map(t => (
                  <option key={t.idTipoAnimal} value={t.idTipoAnimal}>{t.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Corral Asignado</label>
              <select
                value={form.idCorral}
                onChange={e => setForm(f => ({ ...f, idCorral: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {corrales.map(c => (
                  <option key={c.idCorral} value={c.idCorral}>{c.nombre} (Máx: {c.capacidadMaxima})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Raza Dinámica y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Raza</label>
              <select
                value={form.idRaza}
                onChange={handleRazaChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {razasDisponibles.map(r => (
                  <option key={r.idRaza} value={r.idRaza}>{r.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Estado</label>
              <select
                value={form.estado}
                onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {ESTADOS.map(es => <option key={es} value={es}>{es}</option>)}
              </select>
            </div>
          </div>

          {/* Input condicional para especificar el Mestizo / Cruza */}
          {esMestizo && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
                Detalle de la Cruza (Mestizo) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required={esMestizo}
                value={form.detalleMestizo}
                onChange={e => setForm(f => ({ ...f, detalleMestizo: e.target.value }))}
                placeholder="Ej. Cruza de Angus con Hereford"
                className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                value={form.fechaNacimiento}
                onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Fecha de Ingreso</label>
              <input
                type="date"
                required
                value={form.fechaIngreso}
                onChange={e => setForm(f => ({ ...f, fechaIngreso: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              {animalAEditar ? 'Guardar Cambios' : 'Registrar Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}