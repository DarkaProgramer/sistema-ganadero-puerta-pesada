# CLAUDE.md — Contexto y reglas del proyecto Rancho Puerta Pesada

Este archivo lo lee cualquier asistente de IA (Claude, Copilot, Cursor, ChatGPT…) antes de trabajar en el repo.
Si una regla de aquí cambia, actualiza este archivo en el mismo commit.

## 1. Qué es el proyecto

Sistema web para administrar un rancho ganadero de pequeña/mediana escala: personal, ganado, corrales,
pesajes, sanidad, inventario, ventas y clientes. Lo usa el personal del rancho (no es público).
Se mantiene y se le agregan funciones conforme el cliente las pide.

- Idioma: **todo en español** (UI, mensajes de error, comentarios, nombres de variables y commits).
- Moneda por defecto `MXN`, unidad de peso por defecto `kg` (configurables por el administrador).

## 2. Estructura

```
Back-end/                 API REST (Node 22, Express 4, Prisma 5, PostgreSQL)
  prisma/schema.prisma    Modelo de datos (fuente de verdad de la BD)
  prisma/seed.js          Precarga de tipos de animal y razas
  src/index.js            Arranque, CORS, montaje de rutas, /health
  src/config/db.js        Instancia única de PrismaClient
  src/routes/*.js         Definición de rutas
  src/controllers/*.js    Lógica de negocio
Front-end/rancho-app/     React 19 + Vite + Tailwind 4 + lucide-react
  src/config/api.js       API_URL (usa VITE_API_URL o http://localhost:4000)
  src/App.jsx             "Router" por estado (no usa react-router)
  src/context/RanchoContext.jsx  Identidad del rancho (nombre, logo, moneda, unidad)
  src/views/              Una vista por módulo
  src/views/forms/        Formularios de modales
  src/data/mockData.js    Datos de ejemplo de módulos aún sin backend
render.yaml               Blueprint de despliegue en Render (API + front)
```

## 3. Despliegue

- **Backend y frontend en Render** (ver `docs/DEPLOY-RENDER.md`). Antes el backend estaba pensado para Railway.
- Base de datos PostgreSQL externa definida por `DATABASE_URL`.
- Variables del backend: `DATABASE_URL`, `PORT` (Render la pone sola), `CORS_ORIGIN` (opcional, URLs del front separadas por coma).
- Variable del front: `VITE_API_URL` (se inyecta en *build time*; si cambia hay que redesplegar el front).
- **Nunca** subir `.env` ni `node_modules` al repo. Usar los `.env.example` como plantilla.
- Render free "duerme" el backend tras 15 min sin uso; la primera petición tarda ~1 min. Es normal.

## 4. Reglas de código

- Frontend: nunca escribir `http://localhost:4000` a mano. Importar `API_URL` de `src/config/api.js`
  y usar `` fetch(`${API_URL}/api/...`) ``.
- Backend: ES Modules (`import`/`export`, `"type": "module"`), imports con extensión `.js`.
- Cada endpoint en `try/catch`; error 500 con forma `{ error: 'mensaje en español', details: error.message }`.
  Validaciones de negocio responden 400/404 con `{ error }`. Éxito: `{ message, <entidad> }` (los GET devuelven el dato directo).
- IDs llegan como string desde el front: convertir con `Number(...)` antes de usarlos en Prisma.
- Campos opcionales vacíos (`''`) se guardan como `null`.
- Cambios a la BD: editar `schema.prisma` y aplicar con `npx prisma db push` (el proyecto no usa carpeta de migraciones).
  Avisar al usuario antes de cualquier cambio que borre columnas o datos.
- Las tablas usan `@@map` a snake_case; los campos del modelo van en camelCase.
- Estilos solo con clases de Tailwind; iconos solo de `lucide-react`; avisos al usuario con `showToast({ message, type })`.

## 5. Módulos y estado actual

| Módulo | Vista | ¿Conectado al backend? |
|---|---|---|
| Login | LoginView | Sí (`POST /api/empleados/login`) |
| Empleados | EmpleadosView | Sí (`/api/empleados`) |
| Ganado + detalle + línea genética | GanadoView, AnimalDetalleView | Sí (`/api/animales`, `/api/historicos`) |
| Pesaje masivo | PesajeMasivoView | Sí (`/api/historicos`) |
| Configuración (rancho, corrales, tipos, puestos) | ConfiguracionView | Sí (`/api/configuracion`) |
| Dashboard, Ventas, Clientes, Inventario, Vacunación, Calendario | varias | **No**, usan `mockData.js` (los modelos ya existen en Prisma) |

## 6. Reglas de negocio

### Usuarios y roles
- Roles: `Administrador` y `Empleado` (el front también acepta `administrador`/`admin` en minúsculas).
- Solo el Administrador ve y usa **Configuración** (identidad del rancho, corrales, tipos de animal, puestos).
- El correo del empleado es único.
- Si al registrar un empleado no se manda contraseña, se genera una temporal: iniciales del nombre en mayúscula
  + `-` + año actual (ej. "Juan Pérez" en 2026 → `JP-2026`). Se devuelve una sola vez en `passwordTemporal`.
- Al editar un empleado, la contraseña solo cambia si se manda una no vacía.
- Puestos (Capataz, Veterinario, Vaquero, etc.) son un catálogo editable con `activo`. Si se borra un puesto, el empleado queda sin puesto (SetNull).
- ⚠️ Deuda conocida: las contraseñas se guardan en texto plano (campo `contrasenaHash`) y no hay JWT/sesión en el backend.
  No empeorarlo; si se toca el login, proponer bcrypt.

### Ganado
- Identificación: `areteBandera` (obligatorio) y `areteBoton` (opcional). Nombre opcional (el front tiene generador con +100 nombres por género en `nombresGanado.js`).
- `genero`: `Macho` | `Hembra`. `origen`: `Nacimiento` | `Compra`. `estado`: `Vivo` | `Vendido` | `Muerto`.
- Cada animal pertenece a un corral, un tipo de animal y una raza; `detalleMestizo` describe cruzas.
- **Capacidad de corral**: no se puede registrar ni mover un animal a un corral que ya tiene `capacidadMaxima`
  animales con estado distinto de `Muerto` (los `Vendido` todavía cuentan). Error 400.
- **Línea genética**: `idPadre` / `idMadre` solo se guardan si el origen es `Nacimiento`; si es `Compra` se ponen en `null`.
- **Alerta de endogamia**: si el padre o la madre (vivos) están en el mismo corral destino, se guarda igual pero se devuelve `warning` con el aviso. Es advertencia, no bloqueo.
- **Destete**: para animales de origen `Nacimiento`, la meta es a los **6 meses** de la fecha de nacimiento; la ficha muestra cuenta regresiva y luego sugiere cambio de corral.
- Catálogos para formularios (`GET /api/animales/catalogos`): solo tipos de animal y razas con `activo: true`; la lista de posibles padres solo incluye animales `Vivo`.
- Tipos de animal base (seed): Bovino, Equino, Ovino, Caprino, Porcino, con sus razas.

### Pesajes (históricos)
- Cada pesaje tiene fecha, peso (decimal 6,2) y etapa (por defecto `Engorda`).
- El pesaje masivo registra varios animales con una misma fecha y etapa.

### Configuración del rancho
- Existe un solo registro; si no hay, se crea con "Rancho Puerta Pesada", logo `/logo-Rancho.png`, `MXN`, `kg`.
- El nombre y logo se reflejan en Login, Sidebar y Header vía `RanchoContext`.

## 7. Cómo trabajar en este repo

- Correr local: `cd Back-end && npm install && npm run dev` (puerto 4000) y `cd Front-end/rancho-app && npm install && npm run dev`.
- Antes de entregar: `npm run build` en el front debe pasar.
- Commits en español con prefijo tipo `feat:`, `fix:`, `chore:`, `docs:`.
- No meter secretos en el código, ni siquiera de prueba.
