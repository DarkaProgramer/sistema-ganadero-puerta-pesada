// ============================================================
//  mockData.js — Datos simulados para Rancho "Puerta Pesada"
// ============================================================

// ─── CORRALES ───────────────────────────────────────────────
export const corrales = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// ─── ANIMALES ───────────────────────────────────────────────
export const animales = [
  { id: 1,  arete: 'PP-001', nombre: 'Tornado',   raza: 'Brahman',    genero: 'Macho',  fechaNacimiento: '2020-04-10', corral: 'A1', estado: 'activo',  peso: 520 },
  { id: 2,  arete: 'PP-002', nombre: 'La Negra',  raza: 'Angus',      genero: 'Hembra', fechaNacimiento: '2021-07-22', corral: 'A1', estado: 'activo',  peso: 410 },
  { id: 3,  arete: 'PP-003', nombre: 'El Bayo',   raza: 'Charolais',  genero: 'Macho',  fechaNacimiento: '2019-11-03', corral: 'A2', estado: 'vendido', peso: 610 },
  { id: 4,  arete: 'PP-004', nombre: 'Tormenta',  raza: 'Simmental',  genero: 'Hembra', fechaNacimiento: '2022-01-15', corral: 'B1', estado: 'activo',  peso: 380 },
  { id: 5,  arete: 'PP-005', nombre: 'El Rojo',   raza: 'Brahman',    genero: 'Macho',  fechaNacimiento: '2021-03-28', corral: 'B1', estado: 'enfermo', peso: 430 },
  { id: 6,  arete: 'PP-006', nombre: 'Paloma',    raza: 'Criollo',    genero: 'Hembra', fechaNacimiento: '2020-08-14', corral: 'B2', estado: 'activo',  peso: 350 },
  { id: 7,  arete: 'PP-007', nombre: 'Jaguar',    raza: 'Angus',      genero: 'Macho',  fechaNacimiento: '2019-06-30', corral: 'B2', estado: 'vendido', peso: 580 },
  { id: 8,  arete: 'PP-008', nombre: 'La Güera',  raza: 'Charolais',  genero: 'Hembra', fechaNacimiento: '2022-05-11', corral: 'C1', estado: 'activo',  peso: 390 },
  { id: 9,  arete: 'PP-009', nombre: 'Trueno',    raza: 'Cebú',       genero: 'Macho',  fechaNacimiento: '2021-09-07', corral: 'C1', estado: 'activo',  peso: 490 },
  { id: 10, arete: 'PP-010', nombre: 'Canela',    raza: 'Simmental',  genero: 'Hembra', fechaNacimiento: '2023-02-19', corral: 'C2', estado: 'activo',  peso: 310 },
  { id: 11, arete: 'PP-011', nombre: 'El Pinto',  raza: 'Criollo',    genero: 'Macho',  fechaNacimiento: '2020-12-05', corral: 'A2', estado: 'activo',  peso: 455 },
  { id: 12, arete: 'PP-012', nombre: 'Estrella',  raza: 'Brahman',    genero: 'Hembra', fechaNacimiento: '2022-10-23', corral: 'A1', estado: 'enfermo', peso: 340 },
  { id: 13, arete: 'PP-013', nombre: 'Guerrero',  raza: 'Angus',      genero: 'Macho',  fechaNacimiento: '2019-03-17', corral: 'B1', estado: 'activo',  peso: 600 },
  { id: 14, arete: 'PP-014', nombre: 'Luna',      raza: 'Charolais',  genero: 'Hembra', fechaNacimiento: '2021-11-30', corral: 'C1', estado: 'activo',  peso: 420 },
  { id: 15, arete: 'PP-015', nombre: 'Ciclón',    raza: 'Cebú',       genero: 'Macho',  fechaNacimiento: '2020-07-08', corral: 'C2', estado: 'vendido', peso: 540 },
];

// ─── CLIENTES ───────────────────────────────────────────────
export const clientes = [
  {
    id: 1,
    nombre: 'Rancho Los Álamos',
    contacto: 'Roberto Méndez García',
    telefono: '614-555-0123',
    correo: 'rmendes@losalamos.mx',
    ciudad: 'Chihuahua, Chih.',
    saldoPendiente: 45000,
    tipoPago: 'crédito',
    estado: 'activo',
    comprasHistorial: 3,
    totalComprado: 195000,
  },
  {
    id: 2,
    nombre: 'Carnicerías El Norte S.A.',
    contacto: 'María del Carmen Vela',
    telefono: '614-555-0456',
    correo: 'mvela@carnicerias-norte.mx',
    ciudad: 'Delicias, Chih.',
    saldoPendiente: 0,
    tipoPago: 'contado',
    estado: 'activo',
    comprasHistorial: 6,
    totalComprado: 342000,
  },
  {
    id: 3,
    nombre: 'Grupo Ganadero Noroeste',
    contacto: 'José Armando Ríos',
    telefono: '625-555-0789',
    correo: 'jrios@ggnoroeste.mx',
    ciudad: 'Hermosillo, Son.',
    saldoPendiente: 28500,
    tipoPago: 'parcialidades',
    estado: 'activo',
    comprasHistorial: 4,
    totalComprado: 280000,
  },
  {
    id: 4,
    nombre: 'Rastro Municipal Jiménez',
    contacto: 'Ana Lucía Morales',
    telefono: '618-555-0321',
    correo: 'amorales@rastrojimenez.gob.mx',
    ciudad: 'Jiménez, Chih.',
    saldoPendiente: 12000,
    tipoPago: 'parcialidades',
    estado: 'activo',
    comprasHistorial: 2,
    totalComprado: 98000,
  },
  {
    id: 5,
    nombre: 'Rancho La Esperanza',
    contacto: 'Fernando Castillo',
    telefono: '614-555-0654',
    correo: 'fcastillo@laesperanza.mx',
    ciudad: 'Parral, Chih.',
    saldoPendiente: 0,
    tipoPago: 'contado',
    estado: 'activo',
    comprasHistorial: 1,
    totalComprado: 52000,
  },
  {
    id: 6,
    nombre: 'Comercializadora Baja Ganadera',
    contacto: 'Sofía Palomino',
    telefono: '686-555-0987',
    correo: 'spalomino@bajaganadera.mx',
    ciudad: 'Mexicali, B.C.',
    saldoPendiente: 75000,
    tipoPago: 'crédito',
    estado: 'alerta',
    comprasHistorial: 2,
    totalComprado: 155000,
  },
];

// ─── CUENTAS POR COBRAR ──────────────────────────────────────
export const cuentasPorCobrar = [
  { id: 1, clienteId: 1, concepto: 'Venta #VT-2026-008', fechaVenta: '2026-08-15', totalVenta: 85000, pagado: 40000, pendiente: 45000, vencimiento: '2026-10-15', parcialidades: 2, intereses: 0 },
  { id: 2, clienteId: 3, concepto: 'Venta #VT-2026-006', fechaVenta: '2026-07-20', totalVenta: 68500, pagado: 40000, pendiente: 28500, vencimiento: '2026-09-30', parcialidades: 3, intereses: 850 },
  { id: 3, clienteId: 4, concepto: 'Venta #VT-2026-004', fechaVenta: '2026-06-10', totalVenta: 42000, pagado: 30000, pendiente: 12000, vencimiento: '2026-09-10', parcialidades: 2, intereses: 1200 },
  { id: 4, clienteId: 6, concepto: 'Venta #VT-2026-003', fechaVenta: '2026-05-22', totalVenta: 75000, pagado: 0, pendiente: 75000, vencimiento: '2026-08-22', parcialidades: 0, intereses: 4500 },
];

// ─── VENTAS ─────────────────────────────────────────────────
export const ventas = [
  { id: 1, folio: 'VT-2026-001', fecha: '2026-09-12', clienteId: 2, cliente: 'Carnicerías El Norte S.A.', animales: ['PP-003'], cabezas: 1, total: 52000, metodoPago: 'contado',       estado: 'pagado'   },
  { id: 2, folio: 'VT-2026-002', fecha: '2026-09-05', clienteId: 5, cliente: 'Rancho La Esperanza',       animales: ['PP-015'], cabezas: 1, total: 52000, metodoPago: 'contado',       estado: 'pagado'   },
  { id: 3, folio: 'VT-2026-003', fecha: '2026-08-28', clienteId: 6, cliente: 'Comercializadora Baja',     animales: ['PP-007'], cabezas: 1, total: 75000, metodoPago: 'crédito',       estado: 'pendiente'},
  { id: 4, folio: 'VT-2026-004', fecha: '2026-08-10', clienteId: 4, cliente: 'Rastro Municipal Jiménez',  animales: ['PP-003'], cabezas: 1, total: 42000, metodoPago: 'parcialidades', estado: 'parcial'  },
  { id: 5, folio: 'VT-2026-005', fecha: '2026-07-30', clienteId: 2, cliente: 'Carnicerías El Norte S.A.', animales: ['PP-007'], cabezas: 2, total: 98000, metodoPago: 'contado',       estado: 'pagado'   },
  { id: 6, folio: 'VT-2026-006', fecha: '2026-07-15', clienteId: 3, cliente: 'Grupo Ganadero Noroeste',   animales: ['PP-015'], cabezas: 3, total: 68500, metodoPago: 'parcialidades', estado: 'parcial'  },
  { id: 7, folio: 'VT-2026-007', fecha: '2026-06-20', clienteId: 2, cliente: 'Carnicerías El Norte S.A.', animales: ['PP-003'], cabezas: 4, total: 124000,metodoPago: 'transferencia', estado: 'pagado'   },
  { id: 8, folio: 'VT-2026-008', fecha: '2026-06-05', clienteId: 1, cliente: 'Rancho Los Álamos',         animales: ['PP-007'], cabezas: 2, total: 85000, metodoPago: 'crédito',       estado: 'parcial'  },
];

// ─── INVENTARIO ─────────────────────────────────────────────
export const inventario = [
  // Vehículos
  { id: 1,  categoria: 'Vehículo', nombre: 'Tractor John Deere 5075E',  cantidad: 1,  unidad: 'unidad',    estado: 'disponible',    ultimaRevision: '2026-08-20', ubicacion: 'Bodega Principal', valor: 850000 },
  { id: 2,  categoria: 'Vehículo', nombre: 'Camioneta Ford F-150 2022', cantidad: 1,  unidad: 'unidad',    estado: 'disponible',    ultimaRevision: '2026-09-01', ubicacion: 'Estacionamiento', valor: 520000 },
  { id: 3,  categoria: 'Vehículo', nombre: 'Cuatrimoto Honda ATV 420', cantidad: 2,  unidad: 'unidad',    estado: 'en_reparacion', ultimaRevision: '2026-07-15', ubicacion: 'Taller',          valor: 85000  },
  { id: 4,  categoria: 'Vehículo', nombre: 'Remolque de 3 ejes',       cantidad: 1,  unidad: 'unidad',    estado: 'disponible',    ultimaRevision: '2026-08-05', ubicacion: 'Bodega Principal', valor: 180000 },
  // Equipo
  { id: 5,  categoria: 'Equipo',   nombre: 'Báscula ganadera digital', cantidad: 1,  unidad: 'unidad',    estado: 'disponible',    ultimaRevision: '2026-09-10', ubicacion: 'Corral A1',        valor: 45000  },
  { id: 6,  categoria: 'Equipo',   nombre: 'Bomba de agua eléctrica',  cantidad: 2,  unidad: 'unidad',    estado: 'disponible',    ultimaRevision: '2026-08-28', ubicacion: 'Pozo principal',   valor: 22000  },
  { id: 7,  categoria: 'Equipo',   nombre: 'Generador eléctrico 12kW', cantidad: 1,  unidad: 'unidad',    estado: 'en_reparacion', ultimaRevision: '2026-06-15', ubicacion: 'Taller',           valor: 65000  },
  { id: 8,  categoria: 'Equipo',   nombre: 'Cercadora de postes',      cantidad: 1,  unidad: 'unidad',    estado: 'disponible',    ultimaRevision: '2026-09-05', ubicacion: 'Bodega Principal', valor: 28000  },
  { id: 9,  categoria: 'Equipo',   nombre: 'Pistola de inseminación',  cantidad: 3,  unidad: 'unidad',    estado: 'disponible',    ultimaRevision: '2026-09-12', ubicacion: 'Clínica',          valor: 3500   },
  // Alimento e insumos
  { id: 10, categoria: 'Alimento', nombre: 'Alfalfa achicalada',       cantidad: 85, unidad: 'pacas',     estado: 'stock_bajo',    ultimaRevision: '2026-09-18', ubicacion: 'Bodega Forrajes',  valor: 350    },
  { id: 11, categoria: 'Alimento', nombre: 'Alimento concentrado 20%', cantidad: 12, unidad: 'costales',  estado: 'stock_bajo',    ultimaRevision: '2026-09-18', ubicacion: 'Bodega Forrajes',  valor: 580    },
  { id: 12, categoria: 'Alimento', nombre: 'Sales minerales bovinas',  cantidad: 40, unidad: 'kg',        estado: 'disponible',    ultimaRevision: '2026-09-10', ubicacion: 'Bodega Insumos',   valor: 35     },
  { id: 13, categoria: 'Alimento', nombre: 'Sorgo forrajero',          cantidad: 2800,unidad: 'kg',       estado: 'disponible',    ultimaRevision: '2026-09-15', ubicacion: 'Silo',             valor: 4.2    },
  // Medicamentos / Veterinaria
  { id: 14, categoria: 'Veterinaria', nombre: 'Bovishield Gold 5',     cantidad: 8,  unidad: 'frascos',   estado: 'stock_bajo',    ultimaRevision: '2026-09-18', ubicacion: 'Clínica',          valor: 320    },
  { id: 15, categoria: 'Veterinaria', nombre: 'Ivermectina 1%',        cantidad: 5,  unidad: 'litros',    estado: 'disponible',    ultimaRevision: '2026-09-10', ubicacion: 'Clínica',          valor: 280    },
];

// ─── VACUNACIONES ────────────────────────────────────────────
export const vacunaciones = [
  { id: 1, fecha: '2026-09-01', vacuna: 'Bovishield Gold 5',       corral: 'A1',  cantidadAnimales: 12, responsable: 'Dr. Carlos Torres',  dosis: '5 ml', lote: 'VB-2026-001', observaciones: 'Sin reacciones adversas.' },
  { id: 2, fecha: '2026-08-15', vacuna: 'Ivermectina 1%',          corral: 'B1',  cantidadAnimales: 10, responsable: 'Dr. Carlos Torres',  dosis: '1 ml/50kg', lote: 'IV-2026-042', observaciones: 'Desparasitación general.' },
  { id: 3, fecha: '2026-08-01', vacuna: 'Carbón 7',                corral: 'C1',  cantidadAnimales: 8,  responsable: 'Ing. Luis Herrera',  dosis: '5 ml', lote: 'C7-2026-015', observaciones: 'Refuerzo anual completado.' },
  { id: 4, fecha: '2026-07-10', vacuna: 'Rabia Paralítica Bovina', corral: 'B2',  cantidadAnimales: 9,  responsable: 'Dr. Carlos Torres',  dosis: '2 ml', lote: 'RP-2026-008', observaciones: 'Zona de alto riesgo confirmada.' },
  { id: 5, fecha: '2026-06-20', vacuna: 'IBR + BVD (Combo)',       corral: 'A2',  cantidadAnimales: 11, responsable: 'Ing. Luis Herrera',  dosis: '5 ml', lote: 'IB-2026-022', observaciones: 'Pre-temporada reproductiva.' },
  { id: 6, fecha: '2026-05-05', vacuna: 'Clostridiosis 7 cepas',   corral: 'C2',  cantidadAnimales: 7,  responsable: 'Dr. Carlos Torres',  dosis: '5 ml', lote: 'CL-2026-031', observaciones: 'Sin incidentes. Animales en buen estado.' },
];

// ─── EVENTOS DEL CALENDARIO ──────────────────────────────────
export const eventos = [
  { id: 1, titulo: 'Vacunación Corrales B2 y C2',      tipo: 'vacunacion',    fecha: '2026-09-25', hora: '07:00', responsable: 'Dr. Carlos Torres',  descripcion: 'Aplicación de Bovishield Gold 5 y revacunación IBR+BVD.' },
  { id: 2, titulo: 'Mantenimiento Tractor John Deere',  tipo: 'mantenimiento', fecha: '2026-09-27', hora: '09:00', responsable: 'Mec. Pedro Salinas', descripcion: 'Cambio de aceite, filtros y revisión de frenos.' },
  { id: 3, titulo: 'Venta programada — Carnicerías El Norte', tipo: 'venta', fecha: '2026-09-30', hora: '10:00', responsable: 'Ing. Marco Ruiz',   descripcion: 'Entrega de 4 cabezas de ganado Angus, folio VT-2026-009.' },
  { id: 4, titulo: 'Visita Médico Veterinario',         tipo: 'veterinaria',   fecha: '2026-10-02', hora: '08:30', responsable: 'Dr. Carlos Torres',  descripcion: 'Revisión de PP-005 y PP-012 (animales enfermos). Diagnóstico y tratamiento.' },
  { id: 5, titulo: 'Pedido de alfalfa y concentrado',   tipo: 'inventario',    fecha: '2026-10-05', hora: '11:00', responsable: 'Ing. Marco Ruiz',   descripcion: 'Reabastecer bodega de forrajes. Proveedor: Agro-Norte Chihuahua.' },
  { id: 6, titulo: 'Desparasitación General',           tipo: 'vacunacion',    fecha: '2026-10-10', hora: '07:00', responsable: 'Ing. Luis Herrera', descripcion: 'Aplicación de Ivermectina a todos los corrales.' },
  { id: 7, titulo: 'Revisión de cercas — Corrales B',   tipo: 'mantenimiento', fecha: '2026-10-14', hora: '08:00', responsable: 'Mec. Pedro Salinas', descripcion: 'Reparación de 3 tramos dañados en corral B1 y B2.' },
  { id: 8, titulo: 'Cobro parcialidad — Grupo Ganadero',tipo: 'cobro',         fecha: '2026-09-30', hora: '12:00', responsable: 'Ing. Marco Ruiz',   descripcion: 'Tercer y último pago del folio VT-2026-006. Monto: $28,500.' },
];

// ─── MÉTRICAS DEL DASHBOARD ──────────────────────────────────
export const metricas = {
  totalAnimales: 127,
  gananciaMes: 285000,
  alertasInventario: 3,
  proximosEventos: 4,
  gananciaAnterior: 198000,
  animalesActivos: 109,
  animalesVendidos: 14,
  animalesEnfermos: 4,
};

// ─── DISTRIBUCIÓN POR RAZA (para mini-gráfica) ───────────────
export const distribucionRaza = [
  { raza: 'Brahman',   cantidad: 32, color: 'bg-emerald-500' },
  { raza: 'Angus',     cantidad: 28, color: 'bg-slate-600'   },
  { raza: 'Charolais', cantidad: 24, color: 'bg-amber-500'   },
  { raza: 'Simmental', cantidad: 19, color: 'bg-blue-500'    },
  { raza: 'Cebú',      cantidad: 15, color: 'bg-rose-500'    },
  { raza: 'Criollo',   cantidad: 9,  color: 'bg-purple-500'  },
];
