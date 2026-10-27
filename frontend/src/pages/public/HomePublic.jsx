import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Truck, Award, ShieldCheck, Headset } from 'lucide-react';
import { apiFetch } from '../../api';
import { BannerCarousel } from '../../components/public/BannerCarousel';
import { ProductCardPublic } from '../../components/public/ProductCardPublic';
import { useCarrito } from '../../context/CarritoContext';

const RAZONES = [
  { icono: Truck, titulo: 'Envío Rápido', texto: 'Recibe tus pedidos en 24-48 horas en Lima y 3-5 días a nivel nacional.' },
  { icono: Award, titulo: 'Garantía', texto: 'Todos nuestros productos incluyen garantía oficial del fabricante.' },
  { icono: ShieldCheck, titulo: 'Pago Seguro', texto: 'Aceptamos todas las tarjetas y métodos de pago con estándares de alta seguridad.' },
  { icono: Headset, titulo: 'Soporte 24/7', texto: 'Nuestro equipo está disponible para ayudarte en todo momento.' },
];

export function HomePublic() {
  const { tienda, color } = useOutletContext();
  const carritoCtx = useCarrito();
  const { id: empresaId } = tienda;

  const [contenido, setContenido] = useState({});
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let activo = true;
    apiFetch(`/api/tienda/${empresaId}/contenido/home`)
      .then((data) => { if (activo) { setContenido(data.contenido || {}); setBanners(data.banners || []); } })
      .catch(() => {});
    return () => { activo = false; };
  }, [empresaId]);

  const destacados = (tienda.productos || []).filter((p) => p.destacado);
  const mostrarStock = tienda.mostrarStock;
  const comprar = (producto) => {
    carritoCtx?.agregarAlCarrito(producto);
    carritoCtx?.setVistaInicial('carrito');
    carritoCtx?.setDrawerAbierto(true);
  };

  return (
    <>
      <section className="relative w-full h-[85vh] min-h-[480px]">
        {banners.length > 0 ? (
          <BannerCarousel banners={banners} />
        ) : (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: tienda.bannerUrl
                ? `url(${tienda.bannerUrl})`
                : 'linear-gradient(135deg, #13201d 0%, #1a3a2f 100%)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center px-[8%]">
              <div className="max-w-[500px] text-white">
                <span className="inline-block mb-3 px-3.5 py-1.5 rounded-full bg-[#0e9f6e] text-white text-xs font-extrabold uppercase tracking-wider">
                  {contenido.titulo_principal || tienda.nombreComercial}
                </span>
                <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">
                  {contenido.subtitulo_principal || tienda.slogan || 'Bienvenido a nuestra tienda'}
                </h1>
                <Link
                  to={`/t/${empresaId}/tienda`}
                  className="inline-flex items-center justify-center min-h-[46px] px-7 rounded-xl text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
                  style={{ backgroundColor: color }}
                >
                  {contenido.texto_boton_catalogo || 'Ver catálogo'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {tienda.categorias?.length > 0 && (
        <section className="flex flex-col md:flex-row gap-10 max-w-[1400px] mx-auto px-6 md:px-10 py-14">
          <aside className="md:w-[200px] shrink-0">
            <h2 className="text-xl font-serif font-bold text-[#172033] pb-3 border-b border-[#4a4a4a]">Explorar categorías</h2>
          </aside>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {tienda.categorias.map((cat) => (
              <Link
                key={cat.id}
                to={`/t/${empresaId}/productos?categoria=${encodeURIComponent(cat.nombre)}`}
                className="relative block aspect-[3/4] overflow-hidden bg-[#1a1a1a]"
              >
                <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-5 left-5 text-white text-xs font-bold tracking-widest z-10">
                  {cat.nombre.toUpperCase()} &rarr;
                </span>
              </Link>
            ))}
            <Link
              to={`/t/${empresaId}/productos`}
              className="relative aspect-[3/4] bg-[#13201d] flex items-center justify-center hover:bg-[#2563eb] transition-colors"
            >
              <span className="text-white text-base font-bold tracking-widest">VER MAS &rarr;</span>
            </Link>
          </div>
        </section>
      )}

      {destacados.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-[#13201d] mb-2">
              {contenido.seccion_destacados_titulo || 'Productos Destacados'}
            </h2>
            <p className="text-[#667085]">
              {contenido.seccion_destacados_subtitulo || 'Los componentes más populares de nuestro catálogo'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destacados.slice(0, 8).map((p) => (
              <ProductCardPublic
                key={p.id}
                producto={p}
                color={color}
                mostrarStock={mostrarStock}
                onComprar={() => comprar(p)}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to={`/t/${empresaId}/productos`}
              className="inline-flex items-center justify-center min-h-[46px] px-8 rounded-xl text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
              style={{ backgroundColor: color }}
            >
              Ver todos los productos
            </Link>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-br from-[#e9f1ff] to-[#f0fdf4] py-14 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-[#13201d] mb-2">
              {contenido.seccion_razones_titulo || '¿Por qué elegirnos?'}
            </h2>
            <p className="text-[#667085]">
              {contenido.seccion_razones_subtitulo || 'Somos tu mejor opción en componentes electrónicos'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {RAZONES.map(({ icono: Icono, titulo, texto }) => (
              <div
                key={titulo}
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-white/80 hover:-translate-y-1.5 hover:shadow-lg transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f1f5f9] flex items-center justify-center text-2xl text-[#1e293b] group-hover:bg-[#e0edff] group-hover:text-[#2563eb] group-hover:scale-110 transition-all">
                  <Icono size={26} />
                </div>
                <h4 className="text-lg font-bold text-[#13201d] mb-2">{titulo}</h4>
                <p className="text-[#667085] text-sm leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-10 text-center">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#13201d] mb-2">¿Necesitas ayuda?</h2>
          <p className="text-[#667085]">Estamos aquí para orientarte en tu compra</p>
        </div>
        <Link
          to={`/t/${empresaId}/contactanos`}
          className="inline-flex items-center justify-center min-h-[46px] px-8 rounded-xl text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
          style={{ backgroundColor: color }}
        >
          Contáctanos ahora
        </Link>
      </section>
    </>
  );
}
