import { useEffect, useMemo, useState } from 'react';
import { SidebarItem } from '../components/SidebarItem';
import { StatCard } from '../components/StatCard';
import { InventoryRow } from '../components/InventoryRow';
import { useOutletContext } from 'react-router-dom';

import { NavLink } from 'react-router-dom';

import { 
  ShoppingCart, 
  Package, 
  Truck, 
  Plus, 
  TrendingUp,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { apiFetch } from '../api';

export function Dashboard(){
  const { productos, proveedores } = useOutletContext()
  const [ventas, setVentas] = useState([])

  useEffect(() => {
    apiFetch('/api/ventas')
      .then(setVentas)
      .catch(() => {});
  }, [])

  const productosCriticos = useMemo(() => {
    return productos.filter(prod => prod.stockActual <= (prod.stockMinimo || 5));
  }, [productos])

  const ventasDelDia = useMemo(() => {
    const hoy = new Date().toDateString();
    return ventas
      .filter(v => v.fecha && new Date(v.fecha).toDateString() === hoy)
      .reduce((acc, v) => acc + Number(v.totalVenta || 0), 0);
  }, [ventas])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <main className="flex-1 flex flex-col overflow-y-auto">

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
              <p className="text-slate-500 text-sm">Controla tus ventas y stock de hoy.</p>
            </div>
            <div className="flex space-x-3">
              <NavLink to={'/dashboard/ventas'} className="cursor-pointer bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2" >
                <SidebarItem icon={Plus} label="Nueva Venta" className="cursor-pointer"/>
              </NavLink>
              <NavLink to={'/dashboard/compras'} className="cursor-pointer bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center space-x-2">
                <SidebarItem icon={Truck} label="Realizar Pedido" className="cursor-pointer"/>
              </NavLink>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Ventas del Día" value={"S/ " + ventasDelDia.toFixed(2)} change="Hoy" trend="up" icon={Wallet} />
            <StatCard title="Bajo Stock" value={productosCriticos.length + " prod."} change="Crítico" trend="down" icon={AlertTriangle} colorClass="text-amber-500" />
            <StatCard title="Productos" value={productos.length + " items"} change="Inventario" trend="up" icon={Package} colorClass="text-blue-500" />
            <StatCard title="Proveedores" value={proveedores.length + " activos"} change="Contactos" trend="up" icon={Truck} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center space-x-2">
                   <Package size={18} className="text-emerald-600" />
                   <span>Inventario Crítico</span>
                </h2>
                <NavLink to={'/dashboard/inventario'} className="cursor-pointer text-emerald-600 text-xs font-bold hover:underline">Ver Almacén</NavLink>
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
                    </tr>
                  </thead>
                  <tbody>
                    {productos.length === 0 && (
                      <tr><td colSpan="5" className="py-8 text-center text-sm text-slate-400 font-medium">No hay productos</td></tr>
                    )}
                    {productos.map((prod) => (
                      <InventoryRow 
                        key={prod.id} 
                        name={prod.nombre} 
                        category={prod.categoria?.nombre || '—'} 
                        stock={prod.stockActual} 
                        price={prod.precioVenta} 
                        status={prod.stockActual > (prod.stockMinimo || 5) ? 'Disponible' : prod.stockActual > 3 ? 'Bajo Stock' : 'Crítico'} 
                      />
                    ))}
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
                    <NavLink to={'/dashboard/compras'} className="cursor-pointer bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all inline-block">
                      Hacer pedido rápido
                    </NavLink>
                  </div>
                  <ShoppingCart size={150} className="absolute -bottom-10 -right-10 text-white opacity-5 rotate-12" />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
