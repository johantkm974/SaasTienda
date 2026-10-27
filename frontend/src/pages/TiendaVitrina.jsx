import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { formatearPrecio, IMAGEN_PLACEHOLDER } from '../utils/formato';
import '../styles/vitrina.css';

export function TiendaVitrina() {
  const { tienda, color } = useOutletContext();
  const carritoCtx = useCarrito();
  const { id: empresaId } = tienda;

  const productos = tienda?.productos || [];

  const piezaPrincipal = useMemo(
    () => [...productos].sort((a, b) => (b.precioVenta || 0) - (a.precioVenta || 0))[0],
    [productos]
  );

  const destacados = productos.filter((p) => p.destacado);
  const cartelera = destacados.length > 0 ? destacados : productos.slice(0, 8);

  const piezasOrdenadas = useMemo(() => {
    const sinPrincipal = productos.filter((p) => p.id !== piezaPrincipal?.id);
    return sinPrincipal.map((p, i) => ({ ...p, ancho: i % 5 === 0 ? 'ancho-doble' : i % 3 === 1 ? 'ancho-mitad' : '' }));
  }, [productos, piezaPrincipal]);

  const enBandeja = (id) => carritoCtx?.carrito.find((i) => i.id === id)?.cantidad || 0;

  const agregar = (p) => carritoCtx?.agregarAlCarrito(p);

  return (
    <div className="vitrina" style={{ '--color-tienda': color || '#2563eb' }}>
      {/* HERO editorial */}
      <section className="vitrina-hero">
        <span className="vitrina-tag">
          <ShoppingBag size={14} />
          Vitrina {tienda.nombreComercial}
        </span>
        <h1>{tienda.slogan || 'La colección.'}</h1>
        <p className="vitrina-sub">
          {tienda.productos.length} piezas curadas, seleccionadas para ti.
          Agrégalas a tu bandeja y paga en un paso.
        </p>
        <div className="vitrina-meta">
          <span>{tienda.categorias?.length || 0} categorías</span>
          <span>Envío calculado al confirmar</span>
          {tienda.telefono && <span>{tienda.telefono}</span>}
        </div>
      </section>

      {/* PIEZA PRINCIPAL */}
      {piezaPrincipal && (
        <section className="vitrina-galeria" style={{ paddingTop: 56 }}>
          <div className="vitrina-collage">
            <div className="vitrina-pieza ancho-doble">
              <div className="pieza-caja" style={{ aspectRatio: '16 / 9' }}>
                <span className="pieza-etiqueta">Pieza central</span>
                <img src={piezaPrincipal.imagenUrl || IMAGEN_PLACEHOLDER} alt={piezaPrincipal.nombre} />
              </div>
              <div className="pieza-info">
                <div>
                  <h3>{piezaPrincipal.nombre}</h3>
                  <p>{piezaPrincipal.marca || piezaPrincipal.categoria?.nombre || 'Pieza de colección'}</p>
                </div>
                <span className="pieza-precio">{formatearPrecio(piezaPrincipal.precioVenta)}</span>
              </div>
              <button
                className={`pieza-boton ${enBandeja(piezaPrincipal.id) > 0 ? 'en-bandeja' : ''}`}
                onClick={() => agregar(piezaPrincipal)}
                disabled={piezaPrincipal.stockActual <= 0}
              >
                <Plus size={14} />
                {enBandeja(piezaPrincipal.id) > 0 ? `En la bandeja (${enBandeja(piezaPrincipal.id)})` : 'Añadir a la bandeja'}
              </button>
            </div>
            <div className="vitrina-pieza alto-total" style={{ gridRow: 'span 2' }}>
              <div className="pieza-caja">
                <img
                  src={tienda.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'}
                  alt="Vitrina"
                />
              </div>
              <div className="pieza-info">
                <div>
                  <h3>La vitrina</h3>
                  <p>Cada pieza tiene su lugar</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CARTELERA HORIZONTAL */}
      {cartelera.length > 0 && (
        <section className="vitrina-cartelera">
          <div className="vitrina-cartelera-track">
            {cartelera.map((p, i) => (
              <div key={p.id} className="cartelera-item" onClick={() => agregar(p)}>
                <span className="cartelera-num">Pieza {String(i + 1).padStart(2, '0')}</span>
                <img className="cartelera-img" src={p.imagenUrl || IMAGEN_PLACEHOLDER} alt={p.nombre} />
                <span className="cartelera-nombre">{p.nombre}</span>
                <span className="cartelera-precio">{formatearPrecio(p.precioVenta)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GALERIA COLLAGE */}
      <section className="vitrina-galeria">
        <div className="vitrina-galeria-head">
          <div>
            <h2>La colección completa</h2>
            <p>Toca una pieza para colocarla en tu bandeja.</p>
          </div>
        </div>
        <div className="vitrina-collage">
          {piezasOrdenadas.length === 0 && (
            <div className="vitrina-pieza ancho-doble">
              <div className="pieza-caja" style={{ aspectRatio: '21/9' }}>
                <img src={IMAGEN_PLACEHOLDER} alt="Sin piezas" />
              </div>
              <div className="pieza-info">
                <h3>La colección está vacía</h3>
              </div>
            </div>
          )}
          {piezasOrdenadas.map((p) => (
            <article key={p.id} className={`vitrina-pieza ${p.ancho}`}>
              <div className="pieza-caja">
                {p.destacado && <span className="pieza-etiqueta">Destacada</span>}
                <img src={p.imagenUrl || IMAGEN_PLACEHOLDER} alt={p.nombre} />
              </div>
              <div className="pieza-info">
                <div>
                  <h3>{p.nombre}</h3>
                  <p>{p.marca || p.categoria?.nombre || 'Pieza de colección'}</p>
                </div>
                <span className="pieza-precio">{formatearPrecio(p.precioVenta)}</span>
              </div>
              <button
                className={`pieza-boton ${enBandeja(p.id) > 0 ? 'en-bandeja' : ''}`}
                onClick={() => agregar(p)}
                disabled={p.stockActual <= 0}
              >
                <Plus size={14} />
                {enBandeja(p.id) > 0 ? `En la bandeja (${enBandeja(p.id)})` : 'Añadir a la bandeja'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
