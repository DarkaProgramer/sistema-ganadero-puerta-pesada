// modulosRoutes.js — Rutas de los módulos nuevos (Tarjetas 1 a 7)
import { Router } from 'express';
import * as expediente from '../controllers/expedienteController.js';
import * as inventario from '../controllers/inventarioController.js';
import * as transacciones from '../controllers/transaccionController.js';
import * as eventos from '../controllers/eventoController.js';
import * as incidencias from '../controllers/incidenciaController.js';
import * as notificaciones from '../controllers/notificacionController.js';
import * as etapas from '../controllers/etapaController.js';

// ── Tarjeta 1: se monta en /api/empleados junto a las rutas existentes ──
export const expedienteRouter = Router();
expedienteRouter.get('/resumen-estatus', expediente.resumenEstatus);
expedienteRouter.get('/:id/expediente', expediente.obtenerExpediente);
expedienteRouter.put('/:id/expediente', expediente.actualizarExpediente);
expedienteRouter.patch('/:id/estatus', expediente.cambiarEstatus);
expedienteRouter.post('/:id/corrales', expediente.asignarCorral);
expedienteRouter.delete('/:id/corrales/:idCorral', expediente.quitarCorral);

// ── Tarjeta 2: /api/inventario ──
export const inventarioRouter = Router();
inventarioRouter.get('/', inventario.obtenerInventario);
inventarioRouter.get('/resumen', inventario.resumenInventario);
inventarioRouter.get('/movimientos', inventario.obtenerMovimientos);
inventarioRouter.put('/umbrales', inventario.actualizarUmbrales);
inventarioRouter.post('/movimientos/:idMovimiento/devolver', inventario.devolverPrestamo);
inventarioRouter.post('/', inventario.crearArticulo);
inventarioRouter.put('/:id', inventario.actualizarArticulo);
inventarioRouter.delete('/:id', inventario.eliminarArticulo);
inventarioRouter.post('/:id/movimientos', inventario.registrarMovimiento);

// ── Tarjeta 3: /api/transacciones ──
export const transaccionesRouter = Router();
transaccionesRouter.get('/', transacciones.obtenerTransacciones);
transaccionesRouter.get('/catalogos', transacciones.obtenerCatalogos);
transaccionesRouter.get('/resumen', transacciones.obtenerResumen);
transaccionesRouter.get('/:id', transacciones.obtenerTransaccion);
transaccionesRouter.post('/', transacciones.registrarTransaccion);
transaccionesRouter.patch('/:id/estado', transacciones.cambiarEstado);

// ── Tarjeta 4: /api/eventos ──
export const eventosRouter = Router();
eventosRouter.get('/', eventos.obtenerEventos);
eventosRouter.get('/calendario', eventos.obtenerCalendario);
eventosRouter.get('/proximos', eventos.obtenerProximos);
eventosRouter.post('/', eventos.crearEvento);
eventosRouter.put('/:id', eventos.actualizarEvento);
eventosRouter.patch('/:id/mover', eventos.moverEvento);
eventosRouter.delete('/:id', eventos.eliminarEvento);
eventosRouter.post('/:id/enviar-correo', eventos.enviarCorreoEvento);

// ── Tarjeta 5: /api/incidencias ──
export const incidenciasRouter = Router();
incidenciasRouter.get('/', incidencias.obtenerIncidencias);
incidenciasRouter.get('/catalogos', incidencias.obtenerCatalogos);
incidenciasRouter.get('/resumen', incidencias.resumenIncidencias);
incidenciasRouter.post('/equipos', incidencias.crearEquipo);
incidenciasRouter.post('/', incidencias.crearIncidencia);
incidenciasRouter.patch('/:id', incidencias.atenderIncidencia);
incidenciasRouter.delete('/:id', incidencias.eliminarIncidencia);

// ── Tarjeta 6: /api/notificaciones ──
export const notificacionesRouter = Router();
notificacionesRouter.get('/', notificaciones.obtenerNotificaciones);
notificacionesRouter.patch('/leer-todas', notificaciones.marcarTodasLeidas);
notificacionesRouter.patch('/:id', notificaciones.marcarLeida);
notificacionesRouter.delete('/', notificaciones.eliminarVarias);
notificacionesRouter.delete('/:id', notificaciones.eliminarNotificacion);

// ── Tarjeta 7: /api/etapas ──
export const etapasRouter = Router();
etapasRouter.get('/', etapas.obtenerEtapas);
etapasRouter.get('/plantillas', etapas.obtenerPlantillas);
etapasRouter.get('/animales', etapas.etapasDeAnimales);
etapasRouter.get('/animal/:id', etapas.etapaDeAnimal);
etapasRouter.put('/tipo/:idTipoAnimal', etapas.guardarEtapasDeTipo);
