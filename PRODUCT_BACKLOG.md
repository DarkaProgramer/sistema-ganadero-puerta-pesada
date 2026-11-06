# Product Backlog — Sistema Ganadero Puerta Pesada

Estado inicial analizado sobre el commit `84335e0` (2026-11-05) y actualizado tras implementar las 7 tarjetas.

**Leyenda:** `[x]` Hecho · `[~]` Parcial · `[ ]` Pendiente · *(previo)* = ya existía antes de esta implementación

## Resumen

| | Antes | Ahora |
|---|---|---|
| Subtareas hechas | 1 / 25 | 25 / 25 |
| Módulos con datos de prueba (`mockData`) | Inventario, Ventas, Calendario, Dashboard, Clientes, Vacunación | Dashboard, Clientes, Vacunación (fuera del alcance de las tarjetas) |

---

## 🪪 Tarjeta 1: Gestión Profesional de Empleados y Ficha a Detalle

- [x] Vista principal con tabla moderna y filtros por estatus (Activo, Inactivo, Vacaciones).
  - Filtros con contador por estatus, buscador por nombre/correo/puesto y columna de estatus. → `EmpleadosView.jsx`
- [x] Formulario de registro/edición con asignación de puestos del catálogo. *(previo)*
- [x] Ficha a detalle: historial de actividades (salud, inventario, incidencias, agenda, transacciones), corrales asignados con responsabilidad, datos de contacto y de emergencia. → `EmpleadoDetalleView.jsx`
- [x] Endpoints de estatus y expediente: `GET/PUT /api/empleados/:id/expediente`, `PATCH /:id/estatus`, `POST/DELETE /:id/corrales`, `GET /resumen-estatus`.

## 📦 Tarjeta 2: Control de Inventarios (Herramientas vs. Consumibles)

- [x] Modelo: `Inventario.tipo` (Herramienta / Consumible), `cantidadActual`, `stockMinimo`, `stockCritico`, `unidad`, ubicación; `MovimientoInventario` con motivo y estado de préstamo.
- [x] Interfaz con alertas de colores: rojo = crítico, amarillo = insuficiente, verde = suficiente; barra de stock con marcas de umbral y aviso de reabastecimiento. → `InventarioView.jsx`
- [x] Entradas / salidas: herramientas se **prestan y devuelven**; consumibles se **descuentan por consumo**. Valida stock insuficiente y tipo de movimiento.
- [x] Sección de umbrales (solo administrador) para editar mínimo y crítico de cada artículo en lote.

## 💰 Tarjeta 3: Módulo de Gestión de Ventas y Compras

- [x] Modelos `Transaccion` (Compra / Venta, folio, cliente o proveedor, fecha, total, estado, método de pago) y `TransaccionDetalle`; nuevo `Proveedor`.
- [x] Formulario: al vender, los animales pasan a **"Vendido"** automáticamente; al comprar, se dan de alta los nuevos ejemplares (validando capacidad del corral); insumos y herramientas mueven el stock. Cancelar revierte animales y stock. → `TransaccionForm.jsx`
- [x] Comprobante con logo, folio, conceptos, total y firmas, listo para imprimir o "Guardar como PDF". → `ComprobanteTransaccion.jsx`
- [x] Historial con filtros (tipo, estado, rango de fechas, búsqueda) y métricas: ingresos, egresos, balance, por cobrar, por pagar e ingresos vs. egresos por mes. → `VentasView.jsx`

## 📅 Tarjeta 4: Agenda / Calendario Inteligente y Notificaciones por Correo

- [x] FullCalendar 6 integrado (mes, semana, lista) en español, con arrastrar y soltar para reprogramar. → `CalendarioView.jsx`
- [x] Eventos automáticos: campañas del módulo de Salud, alertas de stock bajo/crítico y cambios de etapa de los animales.
- [x] Eventos repetibles semanales (días elegibles, ej. cada sábado) o mensuales, con fecha de fin opcional; atajo "Pago semanal".
- [x] Nodemailer en el backend: recordatorio el día del evento, resumen diario de stock bajo y botón "Enviar correo ahora". Sin SMTP funciona en modo simulación. → `services/correoService.js`, `services/programador.js`

## 🚨 Tarjeta 5: Centro de Reportes Internos para Empleados (Incidencias)

- [x] Modelo `Reporte` ampliado: tipo (Animal lesionado, Daño en vehículo/maquinaria, Aviso general), prioridad, estado, foto, respuesta, atendido por, fecha de atención. Equipos (ej. Ford Ranger) asociables.
- [x] Interfaz móvil/web para empleados: botones grandes por tipo, descripción, prioridad y foto opcional desde la cámara (se comprime en el navegador). → `IncidenciasView.jsx`
- [x] Panel de administración: conteo por estado, filtros, detalle con foto, cambio de estatus y respuesta visible para el empleado.

## 🔔 Tarjeta 6: Centro de Notificaciones General y Detallado

- [x] Campanita en el header con contador de no leídas, desplegable y navegación al módulo de origen. → `NotificationBell.jsx`
- [x] Alertas consolidadas: endogamia (progenitor en el mismo corral), stock insuficiente/crítico, eventos y vacunaciones próximos (3 días), incidencias pendientes y cambios de etapa recientes. → `services/notificacionService.js`
- [x] Vista detallada: filtros por tipo y leídas, marcar como leída/no leída, marcar todas, borrar una o todas las leídas. → `NotificacionesView.jsx`

## 🐮 Tarjeta 7: Automatización de Etapas de Desarrollo por Tipo de Ganado

- [x] Parámetros configurables por especie (`EtapaDesarrollo`) con valores sugeridos: Bovino (Cría 0–6, Destete 6–9, Desarrollo 9–18, Engorda 18+), Equino, Ovino, Caprino y Porcino. → `EtapasConfigView.jsx`
- [x] Cálculo automático por fecha de nacimiento y meses transcurridos (`utils/etapas.js`); los pesajes usan la opción "Automática" y el backend asigna la etapa.
- [x] Ficha del animal: etapa actual, línea de tiempo con marcador, avance y fecha del próximo cambio. → `EtapaIndicador.jsx`

---

## Cambios en código existente (mínimos)

| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | Solo campos nuevos (con default u opcionales) y modelos nuevos. Nada renombrado ni eliminado. |
| `src/index.js` | Registro de rutas nuevas, programador de alertas y límite JSON de 5 MB (fotos). |
| `historicoController.js` | Si la etapa llega vacía o `Auto`, se calcula; antes se forzaba `Engorda`. |
| `App.jsx`, `Sidebar.jsx`, `Header.jsx` | Registro de vistas, 3 entradas de menú y campana real. |
| `LoginView.jsx` | Se guarda `idEmpleado` del usuario en sesión. |
| `EmpleadosView.jsx` | Filtros, buscador, columna de estatus y botón de ficha. |
| `AnimalDetalleView.jsx` | Se inserta el indicador de etapa. |
| `HistorialAnimalForm.jsx`, `PesajeMasivoView.jsx` | Opción "Automática" en el selector de etapa. |
| `InventarioView.jsx`, `VentasView.jsx`, `CalendarioView.jsx` | Reescritas: antes solo mostraban `mockData`. |

## Deuda técnica pendiente (fuera de las tarjetas)

- [ ] Contraseñas guardadas en texto plano (sin bcrypt).
- [ ] La API no tiene autenticación (sin JWT/sesión); las restricciones de administrador solo se aplican en el frontend.
- [ ] `DashboardView`, `ClientesView` y `VacunacionView` aún usan `mockData`.
- [ ] El resumen diario de stock por correo recuerda su último envío en memoria: si el servidor se reinicia puede enviarse dos veces el mismo día.
- [ ] La barra lateral no se adapta a pantallas de celular (hay que colapsarla manualmente).
