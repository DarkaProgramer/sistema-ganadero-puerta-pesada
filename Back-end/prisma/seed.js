// prisma/seed.js — Precarga completa de tipos de ganado y sus razas comerciales
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Crea la raza solo si no existe, para poder correr el seed varias veces sin duplicar
async function crearRazaSiNoExiste(idTipoAnimal, nombre) {
  const existe = await prisma.raza.findFirst({ where: { idTipoAnimal, nombre } });
  if (!existe) await prisma.raza.create({ data: { idTipoAnimal, nombre } });
}

// Busca por un filtro y crea solo si no existe
async function buscarOCrear(modelo, where, data) {
  return (await prisma[modelo].findFirst({ where })) ?? prisma[modelo].create({ data });
}

const haceMeses = (meses) => {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - meses);
  return fecha;
};

async function main() {
  console.log('🌱 Iniciando la precarga completa de catálogos maestros...');

  // 1. Tipos de Ganado Principales
  const bovino = await prisma.tipoAnimal.upsert({
    where: { idTipoAnimal: 1 },
    update: {},
    create: { nombre: 'Bovino' }
  });

  const equino = await prisma.tipoAnimal.upsert({
    where: { idTipoAnimal: 2 },
    update: {},
    create: { nombre: 'Equino' }
  });

  const ovino = await prisma.tipoAnimal.upsert({
    where: { idTipoAnimal: 3 },
    update: {},
    create: { nombre: 'Ovino' }
  });

  const caprino = await prisma.tipoAnimal.upsert({
    where: { idTipoAnimal: 4 },
    update: {},
    create: { nombre: 'Caprino' }
  });

  const porcino = await prisma.tipoAnimal.upsert({
    where: { idTipoAnimal: 5 },
    update: {},
    create: { nombre: 'Porcino' }
  });

  // 2. Razas para Bovinos
  const razasBovinas = [
    'Angus', 'Brahman', 'Hereford', 'Charolais', 'Simmental', 
    'Brangus', 'Nelore', 'Beefmaster', 'Holstein', 'Jersey', 
    'Suizo Americano', 'Suizo Europeo', 'Limousin', 'Santa Gertrudis', 'Mestizo / Cruza'
  ];

  for (const raza of razasBovinas) {
    await crearRazaSiNoExiste(bovino.idTipoAnimal, raza);
  }

  // 3. Razas para Equinos
  const razasEquinas = [
    'Cuarto de Milla', 'Azteca', 'Pura Raza Española', 'Árabe', 'Friesian',
    'Appaloosa', 'Paint Horse', 'Percherón', 'Tres Años', 'Criollo',
    'Mestizo / Cruza'
  ];

  for (const raza of razasEquinas) {
    await crearRazaSiNoExiste(equino.idTipoAnimal, raza);
  }

  // 4. Razas para Ovinos
  const razasOvinas = [
    'Dorper', 'Katahdin', 'Pelibuey', 'Suffolk', 'Hampshire',
    'Rambouillet', 'Charollais', 'Blackbelly', 'Merino', 'Katahorper',
    'Mestizo / Cruza'
  ];

  for (const raza of razasOvinas) {
    await crearRazaSiNoExiste(ovino.idTipoAnimal, raza);
  }

  // 5. Razas para Caprinos
  const razasCaprinas = [
    ' Boer', 'Saanen', 'Alpina', 'Toggenburg', 'Nubia (Anglo-Nubian)',
    'Parda Alpina', 'Bores / Cruza', 'Mestizo / Cruza'
  ];

  for (const raza of razasCaprinas) {
    await crearRazaSiNoExiste(caprino.idTipoAnimal, raza);
  }

  // 6. Razas para Porcinos
  const razasPorcinas = [
    'Landrace', 'Large White / Yorkshire', 'Duroc', 'Pietrain', 'Hampshire',
    'Berkshire', 'Poland China', 'Mestizo / Cruza'
  ];

  for (const raza of razasPorcinas) {
    await crearRazaSiNoExiste(porcino.idTipoAnimal, raza);
  }

  console.log('✅ ¡Catálogos completos de Bovinos, Equinos, Ovinos, Caprinos y Porcinos precargados con éxito!');

  await sembrarDatosDePrueba(bovino);
}

// Datos de prueba: al menos un registro por cada módulo conectado al backend
async function sembrarDatosDePrueba(bovino) {
  console.log('🧪 Cargando datos de prueba...');

  // Configuración del rancho
  await buscarOCrear('configuracionRancho', {}, {
    nombreRancho: 'Rancho Puerta Pesada', logoUrl: '/logo-Rancho.png', moneda: 'MXN', unidadPeso: 'kg'
  });

  // Puestos
  const capataz = await buscarOCrear('puestoEmpleado', { nombre: 'Capataz' }, { nombre: 'Capataz' });
  const vaquero = await buscarOCrear('puestoEmpleado', { nombre: 'Vaquero' }, { nombre: 'Vaquero' });
  await buscarOCrear('puestoEmpleado', { nombre: 'Veterinario' }, { nombre: 'Veterinario' });

  // Empleados (upsert por correo: no cambia la contraseña si ya existen)
  const admin = await prisma.empleado.upsert({
    where: { correo: 'admin@rancho.com' },
    update: {},
    create: {
      nombreCompleto: 'Administrador Rancho', correo: 'admin@rancho.com', contrasenaHash: 'Admin-2026',
      rol: 'Administrador', idPuesto: capataz.idPuesto, telefono: '4440000001'
    }
  });
  await prisma.empleado.upsert({
    where: { correo: 'empleado@rancho.com' },
    update: {},
    create: {
      nombreCompleto: 'Juan Pérez', correo: 'empleado@rancho.com', contrasenaHash: 'Empleado-2026',
      rol: 'Empleado', idPuesto: vaquero.idPuesto, telefono: '4440000002'
    }
  });

  // Corrales
  const corralEngorda = await buscarOCrear('corral', { nombre: 'Corral 1 - Engorda' }, { nombre: 'Corral 1 - Engorda', capacidadMaxima: 20 });
  const corralMaternidad = await buscarOCrear('corral', { nombre: 'Corral 2 - Maternidad' }, { nombre: 'Corral 2 - Maternidad', capacidadMaxima: 10 });

  // Ganado: padre, madre y una cría de 3 meses (muestra línea genética y cuenta regresiva de destete)
  const angus = await prisma.raza.findFirst({ where: { idTipoAnimal: bovino.idTipoAnimal, nombre: 'Angus' } });
  const brahman = await prisma.raza.findFirst({ where: { idTipoAnimal: bovino.idTipoAnimal, nombre: 'Brahman' } });

  const toro = await buscarOCrear('animal', { areteBandera: 'MX-0001' }, {
    idCorral: corralEngorda.idCorral, idTipoAnimal: bovino.idTipoAnimal, idRaza: angus.idRaza,
    areteBandera: 'MX-0001', areteBoton: 'B-0001', nombre: 'Toro Bravo', genero: 'Macho', origen: 'Compra',
    fechaNacimiento: haceMeses(36), fechaIngreso: haceMeses(24), estado: 'Vivo'
  });
  const vaca = await buscarOCrear('animal', { areteBandera: 'MX-0002' }, {
    idCorral: corralMaternidad.idCorral, idTipoAnimal: bovino.idTipoAnimal, idRaza: brahman.idRaza,
    areteBandera: 'MX-0002', areteBoton: 'B-0002', nombre: 'Lupita', genero: 'Hembra', origen: 'Compra',
    fechaNacimiento: haceMeses(48), fechaIngreso: haceMeses(30), estado: 'Vivo'
  });
  const cria = await buscarOCrear('animal', { areteBandera: 'MX-0003' }, {
    idCorral: corralMaternidad.idCorral, idTipoAnimal: bovino.idTipoAnimal, idRaza: angus.idRaza,
    areteBandera: 'MX-0003', nombre: 'Canelo', genero: 'Macho', origen: 'Nacimiento',
    fechaNacimiento: haceMeses(3), fechaIngreso: haceMeses(3), estado: 'Vivo',
    idPadre: toro.idAnimal, idMadre: vaca.idAnimal
  });

  // Pesajes (solo si el animal no tiene ninguno)
  const pesajes = [
    [toro, [[2, 610], [0, 640]]],
    [vaca, [[2, 480], [0, 495]]],
    [cria, [[2, 65], [0, 110]]]
  ];
  for (const [animal, registros] of pesajes) {
    const tiene = await prisma.historicoAnimal.count({ where: { idAnimal: animal.idAnimal } });
    if (tiene) continue;
    await prisma.historicoAnimal.createMany({
      data: registros.map(([meses, peso]) => ({
        idAnimal: animal.idAnimal, fecha: haceMeses(meses), peso, etapa: animal === cria ? 'Cría' : 'Engorda'
      }))
    });
  }

  // Salud: una campaña de vacunación en el corral de maternidad
  const hayControles = await prisma.controlSanitario.count();
  if (!hayControles) {
    await prisma.controlSanitario.create({
      data: {
        idCorral: corralMaternidad.idCorral, tipo: 'Vacunación', fecha: haceMeses(1),
        producto: 'Bobact 8', dosis: '5 ml', responsable: admin.idEmpleado, ayudantes: 'Juan Pérez',
        observaciones: 'Campaña de prueba', estado: 'Aplicado',
        tratamientos: {
          create: [
            { idAnimal: vaca.idAnimal, estado: 'Aplicado', fechaAplicacion: haceMeses(1) },
            { idAnimal: cria.idAnimal, estado: 'Omitido', fechaAplicacion: haceMeses(1), observaciones: 'Muy chico, aplicar el próximo mes' }
          ]
        }
      }
    });
  }

  console.log('✅ Datos de prueba listos. Login: admin@rancho.com / Admin-2026');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la siembra de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });