import { NavLink } from 'react-router-dom';
import { Home, Package, Users, MessageSquare, ShoppingCart, LayoutGrid, User } from 'lucide-react';
import { useCarrito } from '../../context/CarritoContext';

export function PublicNavbar({ tienda }) {
  const { id: empresaId } = tienda;
  const ctx = useCarrito();
  const cantidadTotal = ctx?.cantidadTotal || 0;
  const cliente = ctx?.cliente;
  const abrirCarrito = () => { ctx?.setVistaInicial('carrito'); ctx?.setDrawerAbierto(true); };
  const abrirCuenta = () => { ctx?.setVistaInicial('login'); ctx?.setDrawerAbierto(true); };

  const enlaces = [
    { to: `/t/${empresaId}`, icono: Home, label: 'Inicio', end: true },
    { to: `/t/${empresaId}/productos`, icono: Package, label: 'Productos' },
    { to: `/t/${empresaId}/nosotros`, icono: Users, label: 'Nosotros' },
    { to: `/t/${empresaId}/contactanos`, icono: MessageSquare, label: 'Contacto' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1a1a1a] text-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
        <NavLink to={`/t/${empresaId}`} className="bg-white text-black font-black text-xl tracking-widest px-4 py-1.5">
          {(tienda.nombreComercial || 'SV').slice(0, 2).toUpperCase()}
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {enlaces.map(({ to, icono: Icono, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-colors ${
                  isActive ? 'bg-white/10' : 'hover:text-gray-300'
                }`
              }
            >
              <Icono size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={abrirCarrito}
            className="relative inline-flex items-center gap-2 text-sm font-semibold hover:text-gray-300 transition-colors cursor-pointer"
          >
            <ShoppingCart size={16} />
            Carrito
            {cantidadTotal > 0 && (
              <span className="absolute -top-2 -right-3 bg-[#f5b84b] text-[#13201d] text-[10px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                {cantidadTotal}
              </span>
            )}
          </button>
          {cliente ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f5b84b]">
              <User size={16} />
              {cliente.nombres || 'Cliente'}
            </span>
          ) : (
            <button
              type="button"
              onClick={abrirCuenta}
              className="inline-flex items-center gap-2 text-sm font-semibold hover:text-gray-300 transition-colors cursor-pointer"
            >
              <User size={16} />
              Ingresar
            </button>
          )}
          <NavLink to="/login" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-gray-300 transition-colors">
            <LayoutGrid size={16} />
            Panel
          </NavLink>
        </div>

        <nav className="md:hidden w-full flex flex-col border-t border-white/10 mt-2 pt-2">
          {enlaces.map(({ to, icono: Icono, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 py-2.5 text-sm font-semibold tracking-wider border-b border-white/5 ${
                  isActive ? 'text-gray-300' : ''
                }`
              }
            >
              <Icono size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
