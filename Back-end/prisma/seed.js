// prisma/seed.js — Precarga completa de tipos de ganado y sus razas comerciales
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
    await prisma.raza.create({
      data: { idTipoAnimal: bovino.idTipoAnimal, nombre: raza }
    });
  }

  // 3. Razas para Equinos
  const razasEquinas = [
    'Cuarto de Milla', 'Azteca', 'Pura Raza Española', 'Árabe', 'Friesian',
    'Appaloosa', 'Paint Horse', 'Percherón', 'Tres Años', 'Criollo',
    'Mestizo / Cruza'
  ];

  for (const raza of razasEquinas) {
    await prisma.raza.create({
      data: { idTipoAnimal: equino.idTipoAnimal, nombre: raza }
    });
  }

  // 4. Razas para Ovinos
  const razasOvinas = [
    'Dorper', 'Katahdin', 'Pelibuey', 'Suffolk', 'Hampshire',
    'Rambouillet', 'Charollais', 'Blackbelly', 'Merino', 'Katahorper',
    'Mestizo / Cruza'
  ];

  for (const raza of razasOvinas) {
    await prisma.raza.create({
      data: { idTipoAnimal: ovino.idTipoAnimal, nombre: raza }
    });
  }

  // 5. Razas para Caprinos
  const razasCaprinas = [
    ' Boer', 'Saanen', 'Alpina', 'Toggenburg', 'Nubia (Anglo-Nubian)',
    'Parda Alpina', 'Bores / Cruza', 'Mestizo / Cruza'
  ];

  for (const raza of razasCaprinas) {
    await prisma.raza.create({
      data: { idTipoAnimal: caprino.idTipoAnimal, nombre: raza }
    });
  }

  // 6. Razas para Porcinos
  const razasPorcinas = [
    'Landrace', 'Large White / Yorkshire', 'Duroc', 'Pietrain', 'Hampshire',
    'Berkshire', 'Poland China', 'Mestizo / Cruza'
  ];

  for (const raza of razasPorcinas) {
    await prisma.raza.create({
      data: { idTipoAnimal: porcino.idTipoAnimal, nombre: raza }
    });
  }

  console.log('✅ ¡Catálogos completos de Bovinos, Equinos, Ovinos, Caprinos y Porcinos precargados con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la siembra de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });