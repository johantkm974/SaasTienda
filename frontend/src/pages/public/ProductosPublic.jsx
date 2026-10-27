import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiFetch } from '../../api';
import { ProductCardPublic } from '../../components/public/ProductCardPublic';
import { useCarrito } from '../../context/CarritoContext';

export function ProductosPublic() {
  const { tienda, color } = useOutletContext();
  const carritoCtx = useCarrito();
  const { id: empresaId } = tienda;

  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const [contenido, setContenido] = useState({});
  const [textoBoton, setTextoBoton] = useState('Comprar');

  const categoriaActiva = searchParams.get('categoria') || 'all';

  useEffect(() => {
    let activo = true;
    apiFetch(`/api/tienda/${empresaId}/contenido/productos`)
      .then((data) => {
        if (!activo) return;
        setContenido(data.contenido || {});
        if (data.contenido?.texto_boton_comprar) setTextoBoton(data.contenido.texto_boton_comprar);
      })
      .catch(() => {});
    return () => { activo = false; };
  }, [empresaId]);

  const productosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return (tienda.productos || []).filter((p) => {
      const coincideBusqueda =
        !query ||
        [p.nombre, p.marca, p.categoria?.nombre || '', p.codigoSku]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const coincideCategoria =
        categoriaActiva === 'all' || (p.categoria?.nombre || '').toLowerCase() === categoriaActiva.toLowerCase();
      return coincideBusqueda && coincideCategoria;
    });
  }, [tienda.productos, busqueda, categoriaActiva]);

  function cambiarCategoria(nombre) {
    if (nombre === 'all') setSearchParams({}, { replace: true });
    else setSearchParams({ categoria: nombre }, { replace: true });
  }

  const comprar = (producto) => {
    carritoCtx?.agregarAlCarrito(producto);
    carritoCtx?.setVistaInicial('carrito');
    carritoCtx?.setDrawerAbierto(true);
  };

  return (
    <>
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#13201d] mb-2">
            {contenido.titulo || 'Nuestros Productos'}
          </h2>
          <p className="text-[#667085]">
            {contenido.subtitulo || 'Explora nuestro catálogo completo de componentes electrónicos'}
          </p>
        </div>

        <div className="relative max-w-[500px] mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto, marca o categoría..."
            className="w-full bg-white border border-[#d9e2df] rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <button
            onClick={() => cambiarCategoria('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              categoriaActiva === 'all'
                ? 'text-white border-transparent'
                : 'bg-white text-[#667085] border-[#d9e2df] hover:border-[#2563eb]'
            }`}
            style={categoriaActiva === 'all' ? { backgroundColor: color } : {}}
          >
            Todos
          </button>
          {(tienda.categorias || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => cambiarCategoria(cat.nombre)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                categoriaActiva.toLowerCase() === cat.nombre.toLowerCase()
                  ? 'text-white border-transparent'
                  : 'bg-white text-[#667085] border-[#d9e2df] hover:border-[#2563eb]'
              }`}
              style={categoriaActiva.toLowerCase() === cat.nombre.toLowerCase() ? { backgroundColor: color } : {}}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        <p className="text-center text-[#667085] mb-5 font-semibold">
          {productosFiltrados.length} producto(s) encontrado(s)
        </p>

        {productosFiltrados.length === 0 ? (
          <div className="grid place-items-center min-h-[160px] p-6 border border-dashed border-[#d9e2df] rounded-lg bg-white text-[#667085] font-bold text-center">
            No se encontraron productos con esos criterios
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {productosFiltrados.map((p) => (
              <ProductCardPublic
                key={p.id}
                producto={p}
                color={color}
                mostrarStock={tienda.mostrarStock}
                textoBoton={textoBoton}
                onComprar={() => comprar(p)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#13201d] py-12 px-6 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-black mb-3">¿Listo para comprar?</h2>
        <p className="text-white/70 mb-6">Ingresa a nuestra tienda y completa tu pedido en minutos</p>
        <Link
          to={`/t/${empresaId}/productos`}
          className="inline-flex items-center justify-center min-h-[46px] px-8 rounded-xl bg-[#f5b84b] text-[#13201d] font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
        >
          Ir a la Tienda
        </Link>
      </section>
    </>
  );
}
