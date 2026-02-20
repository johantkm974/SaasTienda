import { useState } from 'react';
import { SidebarItem } from '../components/SidebarItem';
import { StatCard } from '../components/StatCard';
import { InventoryRow } from '../components/InventoryRow';

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  TrendingUp,
  AlertTriangle,
  History,
  Store,
  Wallet
} from 'lucide-react';

export function Dashboard(){

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center space-x-2 mb-10 px-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Store size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-900">BodegaControl</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Resumen" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={ShoppingCart} label="Ventas" active={activeTab === 'ventas'} onClick={() => setActiveTab('ventas')} />
          <SidebarItem icon={Package} label="Inventario" active={activeTab === 'inventario'} onClick={() => setActiveTab('inventario')} />
          <SidebarItem icon={Truck} label="Compras" active={activeTab === 'compras'} onClick={() => setActiveTab('compras')} />
          <SidebarItem icon={BarChart3} label="Reportes" active={activeTab === 'reportes'} onClick={() => setActiveTab('reportes')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <SidebarItem icon={Settings} label="Mi Tienda" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all mt-2">
            <History size={20} />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside> */}

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
             <h2 className="font-bold text-slate-800">Bodega "Don Lucho"</h2>
             <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">ABIERTO</span>
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
        </header> */}

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
              <p className="text-slate-500 text-sm">Controla tus ventas y stock de hoy.</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2">
                <Plus size={18} />
                <span>Nueva Venta</span>
              </button>
              <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center space-x-2">
                <Truck size={18} />
                <span>Pedido</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Ventas del Día" value="S/ 842.50" change="15%" trend="up" icon={Wallet} />
            <StatCard title="Bajo Stock" value="12 prod." change="3" trend="down" icon={AlertTriangle} colorClass="text-amber-500" />
            <StatCard title="Compras a Prov." value="S/ 1,200" change="5%" trend="up" icon={Truck} colorClass="text-blue-500" />
            <StatCard title="Ganancia Est." value="S/ 215.40" change="8%" trend="up" icon={TrendingUp} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center space-x-2">
                   <Package size={18} className="text-emerald-600" />
                   <span>Inventario Crítico</span>
                </h2>
                <button className="text-emerald-600 text-xs font-bold hover:underline">Ver Almacén</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <tr>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Precio Venta</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Reposición</th>
                    </tr>
                  </thead>
                  <tbody>
                    <InventoryRow name="Leche Gloria Azul 400g" category="Lácteos" stock={5} price={4.20} status="Bajo Stock" />
                    <InventoryRow name="Gaseosa Inca Kola 3L" category="Bebidas" stock={24} price={12.50} status="Disponible" />
                    <InventoryRow name="Arroz Costeño 1kg" category="Abarrotes" stock={2} price={3.80} status="Crítico" />
                    <InventoryRow name="Aceite Primor 1L" category="Abarrotes" stock={15} price={11.50} status="Disponible" />
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col h-full">
                  <div className="relative z-10">
                    <h3 className="font-bold text-xl mb-4">¿Te falta stock?</h3>
                    <p className="text-emerald-200 text-xs mb-8 leading-relaxed">
                      Conecta directamente con tus distribuidores y realiza pedidos automáticos según tus ventas.
                    </p>
                    <button className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all">
                      Hacer pedido rápido
                    </button>
                  </div>
                  <ShoppingCart size={150} className="absolute -bottom-10 -right-10 text-white opacity-5 rotate-12" />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}