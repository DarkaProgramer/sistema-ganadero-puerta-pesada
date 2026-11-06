// ComprobanteTransaccion.jsx — Resumen imprimible / descargable en PDF de una compra o venta (Tarjeta 3)
import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { useRancho } from '../../context/RanchoContext';
import { formatoFecha, formatoMoneda } from '../../utils/http';

export default function ComprobanteTransaccion({ transaccion: t }) {
  const { ranchoConfig } = useRancho();
  const ref = useRef(null);
  const moneda = ranchoConfig.moneda || 'MXN';
  const contraparte = t.tipo === 'Venta' ? t.cliente : t.proveedor;
  const nombreContraparte = t.tipo === 'Venta' ? t.cliente?.nomCliente : t.proveedor?.nombre;

  // Abre una ventana solo con el comprobante y lanza el diálogo de impresión ("Guardar como PDF" lo descarga)
  const imprimir = () => {
    const ventana = window.open('', '_blank', 'width=820,height=1000');
    if (!ventana) return alert('Permite las ventanas emergentes para imprimir el comprobante.');
    const estilos = [...document.querySelectorAll('style, link[rel="stylesheet"]')].map(n => n.outerHTML).join('');
    ventana.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t.folio}</title>${estilos}
      <style>body{background:#fff;margin:0;padding:24px} @page{margin:14mm}</style></head>
      <body>${ref.current.outerHTML}</body></html>`);
    ventana.document.close();
    // Pequeña espera para que carguen los estilos y el logo antes de imprimir
    setTimeout(() => { ventana.focus(); ventana.print(); }, 600);
  };

  return (
    <div className="space-y-4">
      <div ref={ref} className="bg-white text-slate-800 text-sm">
        <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-emerald-600">
          <div className="flex items-center gap-3">
            <img src={ranchoConfig.logoUrl} alt="" className="w-14 h-14 rounded-xl object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="text-lg font-bold">{ranchoConfig.nombreRancho}</p>
              <p className="text-xs text-slate-500">Comprobante de {t.tipo.toLowerCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">Folio</p>
            <p className="text-lg font-bold text-emerald-700">{t.folio}</p>
            <p className="text-xs text-slate-500">{formatoFecha(t.fecha, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{t.tipo === 'Venta' ? 'Cliente' : 'Proveedor'}</p>
            <p className="font-semibold">{nombreContraparte || '—'}</p>
            {contraparte?.telefono && <p className="text-xs text-slate-500">Tel. {contraparte.telefono}</p>}
            {contraparte?.correo && <p className="text-xs text-slate-500">{contraparte.correo}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Estado / pago</p>
            <p className="font-semibold">{t.estado}{t.metodoPago ? ` · ${t.metodoPago}` : ''}</p>
            {t.empleado && <p className="text-xs text-slate-500">Registró: {t.empleado.nombreCompleto}</p>}
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
              <th className="py-2 px-3">Concepto</th><th className="py-2 px-3">Descripción</th>
              <th className="py-2 px-3 text-right">Cant.</th><th className="py-2 px-3 text-right">P. unitario</th><th className="py-2 px-3 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {t.detalles.map(d => (
              <tr key={d.idDetalle} className="border-b border-slate-100">
                <td className="py-2 px-3">{d.concepto}</td>
                <td className="py-2 px-3">
                  {d.descripcion}
                  {d.animal && <span className="block text-xs text-slate-500">{d.animal.tipoAnimal?.nombre} {d.animal.raza?.nombre} · {d.animal.genero}</span>}
                </td>
                <td className="py-2 px-3 text-right">{d.cantidad}</td>
                <td className="py-2 px-3 text-right">{formatoMoneda(d.precioUnitario, moneda)}</td>
                <td className="py-2 px-3 text-right font-semibold">{formatoMoneda(d.subtotal, moneda)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="py-3 px-3 text-right font-bold uppercase text-xs tracking-wider">Total</td>
              <td className="py-3 px-3 text-right text-lg font-bold text-emerald-700">{formatoMoneda(t.total, moneda)}</td>
            </tr>
          </tfoot>
        </table>

        {t.notas && <p className="mt-3 text-xs text-slate-600"><strong>Notas:</strong> {t.notas}</p>}
        {t.estado === 'Cancelado' && <p className="mt-3 text-center text-red-600 font-bold uppercase tracking-widest">Transacción cancelada</p>}

        <div className="grid grid-cols-2 gap-10 mt-14 text-center text-xs text-slate-500">
          <div className="border-t border-slate-400 pt-2">Entrega</div>
          <div className="border-t border-slate-400 pt-2">Recibe</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={imprimir} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold inline-flex items-center gap-2">
          <Printer size={16} /> Imprimir / Guardar PDF
        </button>
      </div>
    </div>
  );
}
