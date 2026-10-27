import { useCarrito } from '../../context/CarritoContext';
import { formatearPrecio, IMAGEN_PLACEHOLDER } from '../../utils/formato';

export function BandejaCarrito() {
  const ctx = useCarrito();
  if (!ctx) return null;

  const { carrito, cantidadTotal, subtotal, setDrawerAbierto, setVistaInicial } = ctx;
  const visible = carrito.length > 0;

  const pagar = () => {
    setVistaInicial('checkout');
    setDrawerAbierto(true);
  };

  return (
    <div className={`vitrina-bandeja ${visible ? 'visible' : ''}`}>
      <div className="vitrina-bandeja-inner">
        <div className="bandeja-titulo">
          TU BANDEJA
          <strong>{cantidadTotal} pieza{cantidadTotal !== 1 ? 's' : ''}</strong>
        </div>

        <div className="bandeja-items">
          {carrito.map((i) => (
            <div key={i.id} className="bandeja-item" title={`${i.nombre} x${i.cantidad}`}>
              <img src={i.imagen || IMAGEN_PLACEHOLDER} alt={i.nombre} />
              <span>{i.nombre}</span>
              <span className="bandeja-qty">x{i.cantidad}</span>
            </div>
          ))}
        </div>

        <div className="bandeja-total">
          <small>Total</small>
          <strong>{formatearPrecio(subtotal)}</strong>
        </div>

        <button type="button" className="bandeja-pagar" onClick={pagar}>
          Pagar ahora
        </button>
      </div>
    </div>
  );
}
