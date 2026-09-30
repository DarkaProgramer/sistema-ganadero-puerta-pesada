// src/views/forms/AnimalForm.jsx — Formulario modular para Crear y Editar Animales
import { useState } from 'react';

// Listas de nombres preguardados para el rancho
const NOMBRES_MACHOS = [
  'Rayo', 'Trueno', 'Bravo', 'Sultán', 'Toro', 'Furia', 'Centauro', 'Milagro', 'Gitano', 'Zorro',
  'Comanche', 'Pionero', 'Halcón', 'Vencedor', 'Indomable', 'Becerro', 'Corsario', 'Diamante', 'Faraón', 'Goliath',
  'Hércules', 'Imperio', 'Júpiter', 'Monarca', 'Nerón', 'Olimpo', 'Príncipe', 'Rómulo', 'Titán', 'Vikingo',
  'Zeus', 'Apolo', 'Brutus', 'Caesar', 'Dante', 'Eros', 'Fénix', 'Garfield', 'Hunter', 'Ares',
  'Atlas', 'Baco', 'Benton', 'Cesar', 'Chester', 'Cobre', 'Cody', 'Colt', 'Cooper', 'Cuco',
  'Dalton', 'Dexter', 'Diesel', 'Duque', 'Dusty', 'El Mío', 'Emir', 'Enzo', 'Fido', 'Fito',
  'Flaco', 'Fogonero', 'Frijol', 'Fuego', 'Gato', 'Gaucho', 'Genz', 'Gino', 'Goyo', 'Gris',
  'Gus', 'Hank', 'Harley', 'Huesos', 'Igor', 'Indio', 'Jack', 'Jagger', 'Jaz', 'Jerry',
  'Jocker', 'Kaiser', 'Kiko', 'Kobe', 'Kodiak', 'Koko', 'Ladrón', 'León', 'Lobo', 'Loki',
  'Lucas', 'Lucky', 'Mac', 'Machito', 'Mambo', 'Manchas', 'Mariscal', 'Mateo', 'Max', 'Milo'
];

const NOMBRES_HEMBRAS = [
  'Luna', 'Estrella', 'Gitana', 'Mora', 'Paloma', 'Perla', 'Flor', 'Canela', 'Gema', 'Princesa',
  'Lola', 'Margarita', 'Blanquita', 'Rosa', 'Negrita', 'Chiquita', 'Bonita', 'Esperanza', 'Lupe', 'Pinta',
  'Manchitas', 'Reina', 'Duquesa', 'Baronesa', 'Cleo', 'Dafne', 'Fiona', 'Gringa', 'Hera', 'Iris',
  'Julieta', 'Katrina', 'Lila', 'Milagros', 'Nena', 'Opal', 'Pandora', 'Quinta', 'Rafaela', 'Sasha',
  'Tania', 'Úrsula', 'Venus', 'Wanda', 'Xena', 'Yara', 'Zimba', 'Alba', 'Bella', 'Carmela',
  'Dalia', 'Esmeralda', 'Fresa', 'Galaxia', 'Herminia', 'Isabela', 'Jazmín', 'Kira', 'Luna', 'Malva',
  'Nube', 'Olimpia', 'Pastora', 'Queca', 'Rocio', 'Sabrina', 'Teresa', 'Uva', 'Viole', 'Wendy',
  'Ximena', 'Yadira', 'Zulema', 'Agatha', 'Bimba', 'Ceniza', 'Diva', 'Erika', 'Flora', 'Gaviota',
  'Hilda', 'India', 'Joya', 'Katy', 'Linda', 'Mina', 'Nora', 'Oma', 'Pepa', 'Queena',
  'Rina', 'Sultana', 'Tita', 'Ura', 'Vaca', 'Whitney', 'Xinia', 'Yola', 'Zoe', 'Azúcar'
];

const RAZAS = ['Brahman', 'Angus', 'Charolais', 'Simmental', 'Cebú', 'Criollo'];
const ESTADOS = ['Vivo', 'Vendido', 'Muerto'];
const GENEROS = ['Macho', 'Hembra'];

export default function AnimalForm({ animalAEditar, corrales, tiposAnimal, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    areteBandera: animalAEditar?.areteBandera || '',
    areteBoton: animalAEditar?.areteBoton || '',
    nombre: animalAEditar?.nombre || '',
    tipoNombre: animalAEditar?.nombre ? 'manual' : 'aleatorio', // 'aleatorio' o 'manual'
    raza: animalAEditar?.raza || RAZAS[0],
    genero: animalAEditar?.genero || GENEROS[0],
    fechaNacimiento: animalAEditar?.fechaNacimiento ? animalAEditar.fechaNacimiento.split('T')[0] : '',
    fechaIngreso: animalAEditar?.fechaIngreso ? animalAEditar.fechaIngreso.split('T')[0] : new Date().toISOString().split('T')[0],
    idCorral: animalAEditar?.idCorral || corrales[0]?.idCorral || '',
    idTipoAnimal: animalAEditar?.idTipoAnimal || tiposAnimal[0]?.idTipoAnimal || '',
    estado: animalAEditar?.estado || 'Vivo',
    pesoInicial: ''
  });

  const [error, setError] = useState('');

  // Generar un nombre aleatorio basado en el género seleccionado
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
    if (!form.areteBandera || !form.idCorral || !form.idTipoAnimal) {
      setError('El número de arete, corral y tipo de animal son obligatorios.');
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-slate-100 my-8">
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

          {/* Selector de Género primero para condicionar los nombres aleatorios */}
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

          {/* Opción de Nombre: Aleatorio o Manual */}
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
                  🎲 Aleatorio (Pregenerado)
                </button>
                <button
                  type="button"
                  onClick={() => handleTipoNombreChange('manual')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    form.tipoNombre === 'manual' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  ✏️ Escribir Manual
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Tipo de Animal</label>
              <select
                value={form.idTipoAnimal}
                onChange={e => setForm(f => ({ ...f, idTipoAnimal: e.target.value }))}
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
                  <option key={c.idCorral} value={c.idCorral}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Raza</label>
              <select
                value={form.raza}
                onChange={e => setForm(f => ({ ...f, raza: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {RAZAS.map(r => <option key={r}>{r}</option>)}
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

          <div className="flex justify-end gap-3 pt-4">
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