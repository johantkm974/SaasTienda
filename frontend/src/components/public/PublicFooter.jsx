import { Link } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext';

export function PublicFooter({ tienda, contenido }) {
  const c = contenido || {};
  const { id: empresaId, nombreComercial } = tienda;
  const ctx = useCarrito();

  const abrirMisPedidos = () => {
    ctx?.setVistaInicial('compras');
    ctx?.setDrawerAbierto(true);
  };

  return (
    <footer className="mt-16 bg-[#13201d] text-white px-6 md:px-10 py-10">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1200px] mx-auto">
        <div>
          <div className="bg-white text-black font-black text-xl tracking-widest px-4 py-1.5 w-max mb-3">
            {nombreComercial.slice(0, 2).toUpperCase()}
          </div>
          <p className="text-white/70 text-sm leading-relaxed">{c.marca_texto || ''}</p>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest mb-4 text-[#f5b84b] font-bold">Navegación</h4>
          <ul className="space-y-2.5">
            <li><Link to={`/t/${empresaId}`} className="text-white/70 text-sm hover:text-white">Inicio</Link></li>
            <li><Link to={`/t/${empresaId}/productos`} className="text-white/70 text-sm hover:text-white">Productos</Link></li>
            <li><Link to={`/t/${empresaId}/nosotros`} className="text-white/70 text-sm hover:text-white">Nosotros</Link></li>
            <li><Link to={`/t/${empresaId}/contactanos`} className="text-white/70 text-sm hover:text-white">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest mb-4 text-[#f5b84b] font-bold">Servicio</h4>
          <ul className="space-y-2.5">
            <li><Link to={`/t/${empresaId}/productos`} className="text-white/70 text-sm hover:text-white">Tienda Online</Link></li>
            <li>
              <button type="button" onClick={abrirMisPedidos} className="text-white/70 text-sm hover:text-white cursor-pointer">
                Mis pedidos
              </button>
            </li>
            <li><span className="text-white/70 text-sm cursor-default">Garantías</span></li>
            <li><span className="text-white/70 text-sm cursor-default">Devoluciones</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest mb-4 text-[#f5b84b] font-bold">Contacto</h4>
          <ul className="space-y-2.5">
            {c.telefono && <li><a href={`tel:${c.telefono}`} className="text-white/70 text-sm hover:text-white">{c.telefono}</a></li>}
            {c.correo && <li><a href={`mailto:${c.correo}`} className="text-white/70 text-sm hover:text-white">{c.correo}</a></li>}
            {c.direccion && <li><span className="text-white/70 text-sm">{c.direccion}</span></li>}
          </ul>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-6 pt-6 border-t border-white/10 text-center text-white/50 text-xs">
        © {new Date().getFullYear()} {nombreComercial}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
