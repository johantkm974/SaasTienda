import { Outlet, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

export function LayoutDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [empresa, setEmpresa] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem('token-user');
    navigate('/login');
  };

  useEffect(()=>{
    const sessionData = JSON.parse(localStorage.getItem('token-user'))
    const token = sessionData
    console.log(token)

    if(token){
      fetch(`http://localhost:8080/api/empresas`,{
          method : 'GET',
          headers : {
            'Authorization' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
          }
        })
        .then(Response => Response.json())
        .then(data=> {
          console.log(data)
        })
    }
  },[])

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
          <Link to={'/dashboard'}>
            <SidebarItem icon={iconLayoutDashboard} label="Resumen" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          </Link>
          <Link to={'/dashboard/ventas'}>
            <SidebarItem icon={ShoppingCart} label="Ventas" active={activeTab === 'ventas'} onClick={() => setActiveTab('ventas')} />
          </Link>
          <Link to={'/dashboard/inventario'}>
            <SidebarItem icon={Package} label="Inventario" active={activeTab === 'inventario'} onClick={() => setActiveTab('inventario')} />
          </Link>
          <Link to={'/dashboard/compras'}>
            <SidebarItem icon={Truck} label="Compras" active={activeTab === 'compras'} onClick={() => setActiveTab('compras')} />
          </Link>
          <Link to={'/dashboard/reportes'}>
            <SidebarItem icon={BarChart3} label="Reportes" active={activeTab === 'reportes'} onClick={() => setActiveTab('reportes')} />
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <Link to={'/dashboard/ajustes'}>
            <SidebarItem icon={Settings} label="Mi Tienda" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
          </Link>
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
             {/* <h2 className="font-bold text-slate-800">Bodega {`${empresa.nombreComercial}`}</h2> */}
             {/* <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">{`${empresa.estado}`}</span> */}
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
          {/* AQUÍ ES DONDE SE RENDERIZA EL DASHBOARD, LAS VENTAS, ETC. */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}