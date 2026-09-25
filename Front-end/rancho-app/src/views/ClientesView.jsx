// ClientesView.jsx — Listado de compradores y cuentas por cobrar

import { useState } from 'react';
import { Users, DollarSign, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { clientes, cuentasPorCobrar } from '../data/mockData';

export default function ClientesView() {
  const [expandido, setExpandido] = useState(null);

  const totalPendiente = cuentasPorCobrar.reduce((s, c) => s + c.pendiente, 0);
  const totalVencido   = cuentasPorCobrar.filter(c => new Date(c.vencimiento) < new Date()).reduce((s, c) => s + c.pendiente, 0);

  const cuentasDeCliente = (clienteId) =>
    cuentasPorCobrar.filter(c => c.clienteId === clienteId);

  const toggle = (id) => setExpandido(prev => (prev === id ? null : id));

  const pctPagado = (cuenta) =>
    Math.round((cuenta.pagado / cuenta.totalVenta) * 100);

  return (
    <div className="space-y-5">

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Users size={20} className="text-blue-600" />,        bg: 'bg-blue-100',   label: 'Clientes registrados', valor: clientes.length },
          { icon: <DollarSign size={20} className="text-amber-600" />,  bg: 'bg-amber-100',  label: 'Total por cobrar',     valor: `$${totalPendiente.toLocaleString('es-MX')}` },
          { icon: <AlertCircle size={20} className="text-red-500" />,   bg: 'bg-red-100',    label: 'Monto vencido',        valor: `$${totalVencido.toLocaleString('es-MX')}` },
        ].map(({ icon, bg, label, valor }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-slate-800">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lista de clientes expandible ─────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Directorio de Compradores</h3>
          <p className="text-xs text-slate-400 mt-0.5">Haz clic en un cliente para ver sus cuentas por cobrar</p>
        </div>

        <div className="divide-y divide-slate-50">
          {clientes.map(c => {
            const cuentas = cuentasDeCliente(c.id);
            const isOpen  = expandido === c.id;

            return (
              <div key={c.id}>
                {/* Fila principal */}
                <button
                  onClick={() => toggle(c.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                      {c.nombre.charAt(0)}
                    </div>
                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">{c.nombre}</p>
                        <Badge estado={c.estado} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{c.contacto} · {c.ciudad}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-500">Saldo pendiente</p>
                      <p className={`text-sm font-bold ${c.saldoPendiente > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {c.saldoPendiente > 0 ? `$${c.saldoPendiente.toLocaleString('es-MX')}` : 'Al corriente'}
                      </p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-slate-500">Tipo pago</p>
                      <Badge estado={c.tipoPago} />
                    </div>
                    <div className="text-right hidden lg:block">
                      <p className="text-xs text-slate-500">Compras</p>
                      <p className="text-sm font-bold text-slate-700">{c.comprasHistorial}</p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {/* Panel expandible: cuentas por cobrar */}
                {isOpen && (
                  <div className="mx-5 mb-4 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    {cuentas.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-slate-500 text-center">Sin cuentas pendientes. ✅</p>
                    ) : (
                      <>
                        <div className="px-5 py-3 border-b border-slate-200">
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cuentas por Cobrar</p>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {cuentas.map(cuenta => {
                            const pct      = pctPagado(cuenta);
                            const vencida  = new Date(cuenta.vencimiento) < new Date();
                            return (
                              <div key={cuenta.id} className="px-5 py-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">{cuenta.concepto}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Venta: {cuenta.fechaVenta} · Vencimiento: {' '}
                                      <span className={vencida ? 'text-red-500 font-semibold' : 'text-slate-500'}>
                                        {cuenta.vencimiento}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-4">
                                    <p className="text-xs text-slate-500">Pendiente</p>
                                    <p className="text-sm font-bold text-amber-600">${cuenta.pendiente.toLocaleString('es-MX')}</p>
                                  </div>
                                </div>

                                {/* Barra de progreso de pago */}
                                <div className="mb-2">
                                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Pagado: ${cuenta.pagado.toLocaleString('es-MX')}</span>
                                    <span>Total: ${cuenta.totalVenta.toLocaleString('es-MX')}</span>
                                  </div>
                                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1">{pct}% cubierto · {cuenta.parcialidades} parcialidad(es) recibidas</p>
                                </div>

                                {cuenta.intereses > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                                    <AlertCircle size={12} />
                                    <span>Intereses acumulados: ${cuenta.intereses.toLocaleString('es-MX')} por pago tardío</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
