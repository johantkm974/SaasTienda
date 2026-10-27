import { Star } from 'lucide-react';
import { formatearPrecio, IMAGEN_PLACEHOLDER } from '../../utils/formato';

export function ProductCardPublic({ producto, color, mostrarStock, textoBoton, onComprar }) {
  return (
    <article className="bg-white border border-[#d9e2df] rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all">
      <div className="relative h-52 bg-[#e6ecea] flex items-center justify-center overflow-hidden">
        {producto.imagenUrl ? (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <img src={IMAGEN_PLACEHOLDER} alt={producto.nombre} className="w-full h-full object-cover" />
        )}
        {producto.destacado && (
          <span className="absolute top-3 left-3 bg-[#f5b84b] text-[#13201d] text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star size={10} className="fill-current" />
            DESTACADO
          </span>
        )}
      </div>
      <div className="p-4 grid gap-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#e7f7f1] text-[#166534] text-xs font-bold">
            {producto.categoria?.nombre || 'Catálogo'}
          </span>
          {mostrarStock && (
            <span className={`text-xs ${producto.stockActual > 0 ? 'text-[#667085]' : 'text-[#dc2626] font-bold'}`}>
              {producto.stockActual > 0 ? `${producto.stockActual} en stock` : 'Agotado'}
            </span>
          )}
        </div>
        <h3 className="text-lg text-[#13201d] font-bold leading-snug">{producto.nombre}</h3>
        <p className="text-[#667085] text-sm leading-relaxed line-clamp-2">
          {producto.descripcion || 'Producto disponible para compra online.'}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xl font-black text-[#0e9f6e]">{formatearPrecio(producto.precioVenta)}</span>
          <button
            type="button"
            onClick={onComprar}
            disabled={producto.stockActual <= 0}
            className="inline-flex items-center justify-center min-h-[42px] px-6 rounded-xl text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: color }}
          >
            {textoBoton || 'Comprar'}
          </button>
        </div>
      </div>
    </article>
  );
}
