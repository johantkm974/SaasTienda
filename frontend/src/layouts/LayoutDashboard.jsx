import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SidebarItem } from '../components/SidebarItem';
import { 
  LayoutDashboard as iconLayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  History,
  Store,
  Users,
} from 'lucide-react';

export function LayoutDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');

  const [empresa, setEmpresa] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])

  const handleLogout = () => {
    localStorage.removeItem('token-user');
    navigate('/login');
  }

  const addProveedor = (newProveedor)=>{
    fetch('http://localhost:8080/api/proveedores', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token-user'))}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        empresaId: empresa.id,
        nombre: newProveedor.nombre,
        identificacion: newProveedor.identificacion,
        telefono: newProveedor.telefono,
        correo: newProveedor.correo,
        // contactPerson: newProveedor.contactPerson,
        // contactPersonCell: newProveedor.contactPersonCell
      })
    })
      .then(response => response.json())
      .then(data => {
        // actualizar estado de proveedores
        setProveedores([...proveedores, data]);
      })
      .catch(error => console.error('Error al agregar proveedor:', error))
  }

  useEffect(()=>{
    const token = JSON.parse(localStorage.getItem('token-user'))

    if(!token)return

    //cargar datos de la empresa
    fetch(`http://localhost:8080/api/empresas/mi-empresa`,{
        method : 'GET',
        headers : {
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        }
      })
      .then(Response => Response.json())
      .then(data=> setEmpresa(data))

    //cargar productos
    fetch('http://localhost:8080/api/productos', {
      method : 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type' : 'application/json'
      }
    })
    .then(Response => Response.json())
    .then(data => setProductos(data))

    //cargar categorias
    fetch('http://localhost:8080/api/categorias', {
      method : 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type' : 'application/json'
      }
    })
    .then(Response => Response.json())
    .then(data => setCategorias(data));
    
    //cargar proveedores
    fetch('http://localhost:8080/api/proveedores', {
      method : 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type' : 'application/json'
      }
    })
    .then(Response => Response.json())
    .then(data => setProveedores(data));

  },[])

  function navLinkStyle({ isActive }){
    return ` w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 ${
      isActive
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* SIDEBAR FIJO */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center space-x-2 mb-10 px-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Store size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-900">BodegaControl</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavLink to={'/dashboard'} className={navLinkStyle} end>
            <SidebarItem icon={iconLayoutDashboard} label="Resumen"  />
          </NavLink>
          <NavLink to={'/dashboard/ventas'} className={navLinkStyle}>
            <SidebarItem icon={ShoppingCart} label="Ventas" />
          </NavLink>
          <NavLink to={'/dashboard/inventario'} className={navLinkStyle}>
            <SidebarItem icon={Package} label="Inventario" />
          </NavLink>
          <NavLink to={'/dashboard/compras'} className={navLinkStyle}>
            <SidebarItem icon={Truck} label="Compras" />
          </NavLink>
          <NavLink to={'/dashboard/contactos'} className={navLinkStyle}>
            <SidebarItem icon={Users} label="Contactos" />
          </NavLink>
          <NavLink to={'/dashboard/reportes'} className={navLinkStyle}>
            <SidebarItem icon={BarChart3} label="Reportes" />
          </NavLink>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <NavLink to={'/dashboard/ajustes'} className={navLinkStyle}>
            <SidebarItem icon={Settings} label="Mi Tienda" active={activeTab}/>
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all mt-2">
            <History size={20} />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO DINÁMICO */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
             <h2 className="font-bold text-slate-800">Bodega {`${empresa.nombreComercial}`}</h2>
             <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">{`${empresa.estado}`}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Buscar producto..." className="bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-emerald-500 outline-none w-64" />
            </div>
            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Outlet context={{
            productos,
            setProductos,
            categorias,
            setCategorias,
            proveedores,
            setProveedores,
            empresa,
            setEmpresa,
            addProveedor,
            }}/> 
        </div>
      </main>
    </div>
  );
}