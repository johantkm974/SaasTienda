import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SidebarItem } from '../components/SidebarItem';
import SuperadminPanel from '../pages/SuperadminPanel';
import { 
  LayoutDashboard as iconLayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  BarChart3, 
  Settings, 
  Search, 
  History,
  Store,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch, clearToken, getRolFromToken } from '../api';

export function LayoutDashboard() {
  const navigate = useNavigate();

  const esSupremo = getRolFromToken() === 'SUPREMO';
  const esVendedor = getRolFromToken() === 'VENDEDOR';

  const [empresa, setEmpresa] = useState(null)
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [error, setError] = useState(null)
  const [buscarProducto, setBuscarProducto] = useState('')

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  }

  const buscarEnInventario = (e) => {
    e.preventDefault();
    const termino = buscarProducto.trim();
    navigate(termino ? `/dashboard/inventario?busqueda=${encodeURIComponent(termino)}` : '/dashboard/inventario');
  }

  const addProveedor = async (newProveedor) => {
    try {
      const data = await apiFetch('/api/proveedores', {
        method: 'POST',
        body: JSON.stringify({
          nombre: newProveedor.nombre,
          identificacion: newProveedor.identificacion,
          telefono: newProveedor.telefono,
          correo: newProveedor.correo,
        })
      });
      setProveedores((prev) => [...prev, data]);
    } catch (error) {
      alert('Error al agregar proveedor: ' + error.message);
    }
  }

  const addUsuario = async (usuario) => {
    const data = await apiFetch('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario)
    });
    setUsuarios((prev) => [...prev, data]);
    return data;
  }

  const actualizarProveedor = async (id, datos) => {
    const data = await apiFetch(`/api/proveedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
    setProveedores((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }

  const eliminarProveedor = async (id) => {
    await apiFetch(`/api/proveedores/${id}`, { method: 'DELETE' });
    setProveedores((prev) => prev.filter((p) => p.id !== id));
  }

  const actualizarUsuario = async (id, datos) => {
    const data = await apiFetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
    setUsuarios((prev) => prev.map((u) => (u.id === id ? data : u)));
    return data;
  }

  const eliminarUsuario = async (id) => {
    await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }

  useEffect(()=>{
    let activo = true;

    async function cargarDatos() {
      try {
        const [empresaData, productosData, categoriasData, proveedoresData, usuariosData] = await Promise.all([
          apiFetch('/api/empresas/mi-empresa'),
          apiFetch('/api/productos'),
          apiFetch('/api/categorias'),
          apiFetch('/api/proveedores'),
          apiFetch('/api/usuarios'),
        ]);

        if (!activo) return;

        setEmpresa(empresaData);
        setProductos(productosData);
        setCategorias(categoriasData);
        setProveedores(proveedoresData);
        setUsuarios(usuariosData);
      } catch (err) {
        if (!activo) return;
        if (err.message && err.message.includes('401')) {
          clearToken();
          navigate('/login');
        } else {
          setError(err.message);
        }
      }
    }

    if (!esSupremo) {
      cargarDatos();
    }

    return () => { activo = false; };
  }, [navigate, esSupremo])

  function navLinkStyle({ isActive }){
    return ` w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 ${
      isActive
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center space-x-2 mb-10 px-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Store size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-900">BodegaControl</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {esSupremo ? (
            <NavLink to={'/dashboard'} className={navLinkStyle} end>
              <SidebarItem icon={ShieldCheck} label="Panel Supremo" />
            </NavLink>
          ) : (
            <>
              <NavLink to={'/dashboard'} className={navLinkStyle} end>
                <SidebarItem icon={iconLayoutDashboard} label="Resumen"  />
              </NavLink>
              <NavLink to={'/dashboard/ventas'} className={navLinkStyle}>
                <SidebarItem icon={ShoppingCart} label="Ventas" />
              </NavLink>
              <NavLink to={'/dashboard/envios'} className={navLinkStyle}>
                <SidebarItem icon={Truck} label="Envíos" />
              </NavLink>
              <NavLink to={'/dashboard/inventario'} className={navLinkStyle}>
                <SidebarItem icon={Package} label="Inventario" />
              </NavLink>
              {!esVendedor && (
                <NavLink to={'/dashboard/compras'} className={navLinkStyle}>
                  <SidebarItem icon={Truck} label="Compras" />
                </NavLink>
              )}
              {!esVendedor && (
                <NavLink to={'/dashboard/contactos'} className={navLinkStyle}>
                  <SidebarItem icon={Users} label="Contactos" />
                </NavLink>
              )}
              <NavLink to={'/dashboard/reportes'} className={navLinkStyle}>
                <SidebarItem icon={BarChart3} label="Reportes" />
              </NavLink>
              {!esVendedor && (
                <NavLink to={'/dashboard/tienda'} className={navLinkStyle}>
                  <SidebarItem icon={Store} label="Tienda Online" />
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          {!esSupremo && !esVendedor && (
            <NavLink to={'/dashboard/ajustes'} className={navLinkStyle}>
              <SidebarItem icon={Settings} label="Mi Tienda" />
            </NavLink>
          )}
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all mt-2">
            <History size={20} />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
             <h2 className="font-bold text-slate-800">{esSupremo ? 'Superadministrador del SaaS' : `Bodega ${empresa ? empresa.nombreComercial : '...'}`}</h2>
             {empresa && !esSupremo && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">{empresa.estado}</span>}
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={buscarEnInventario} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={buscarProducto}
                onChange={(e) => setBuscarProducto(e.target.value)}
                className="bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-emerald-500 outline-none w-64"
              />
            </form>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-4 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold">
              Error al cargar datos: {error}
            </div>
          )}
          {esSupremo ? (
            <SuperadminPanel />
          ) : (
            <Outlet context={{
              productos,
              setProductos,
              categorias,
              setCategorias,
              proveedores,
              setProveedores,
              empresa,
              setEmpresa,
              usuarios,
              setUsuarios,
              addProveedor,
              addUsuario,
              actualizarProveedor,
              eliminarProveedor,
              actualizarUsuario,
              eliminarUsuario,
              }}/>
          )}
        </div>
      </main>
    </div>
  );
}
