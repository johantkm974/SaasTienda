import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  Search,
  Plus,
  Trash2,
} from 'lucide-react'

export function Ventas(){

  const {productos} = useOutletContext()

  const [cart, setCart] = useState([])

  const total = cart.reduce((acc, item) => acc + (item.precioVenta * item.qty), 0);

  function addToCart(product) {
    console.log(product)
    setCart((prevCart)=>{
      console.log(prevCart)
      const existingItem = prevCart.find(item => item.id === product.id)

      if(existingItem){
        return prevCart.map(item=> item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
        return [...prevCart, {
          id: product.id,
          nombre: product.nombre,
          qty: 1,
          precioVenta: product.precioVenta}]
    })
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Punto de Venta
          </h1>
          <p className="text-slate-500 text-sm">
            Gestiona tu negocio en tiempo real.
          </p>
        </div>
        {/* <div className="flex space-x-3">
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg shadow-slate-200">
            <Plus size={18} />
            Añadir Producto
          </button>
          {activeTab === 'dashboard' && (
            <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center space-x-2">
              <Truck size={18} />
              <span>Pedido</span>
            </button>
          )}
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] animate-in fade-in zoom-in duration-300">
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-3">
            <Search size={20} className="text-slate-400" />
            <input type="text" placeholder="Buscar producto..." className="flex-1 bg-transparent border-none outline-none text-sm font-medium" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {productos.map(p => (
              <button key={p.id}
                onClick={()=>addToCart(p)}
                className="cursor-pointer bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-3 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <Package size={24} />
                </div>
                <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{p.nombre}</p>
                <p className="text-emerald-600 font-black text-sm">S/ {p.precioVenta.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 flex items-center space-x-2">
              <ShoppingCart size={20} className="text-emerald-600" />
              <span>Ticket de Venta</span>
            </h3>
            <button onClick={()=>setCart([])} className="cursor-pointer text-slate-400 hover:text-rose-500"><Trash2 size={18}  /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{item.nombre}</p>
                  <p className="text-xs text-slate-400">S/ {item.precioVenta.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-3 bg-slate-50 rounded-xl p-1 font-bold text-xs text-slate-700">
                  <span>{item.qty} u.</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 bg-slate-50/50 space-y-4">
            <div className="flex justify-between items-center text-2xl font-black text-slate-900 border-t pt-4">
              <span>Total</span>
              <span className="text-emerald-600">S/ {total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="cursor-pointer p-3 border-2 border-slate-100 rounded-2xl bg-white hover:border-emerald-500 transition-all font-bold text-[10px] uppercase text-slate-400">Efectivo</button>
              <button className="cursor-pointer p-3 border-2 border-slate-100 rounded-2xl bg-white hover:border-emerald-500 transition-all font-bold text-[10px] uppercase text-slate-400">Tarjeta</button>
            </div>
            <button className="cursor-pointer w-full bg-emerald-600 text-white py-4 rounded-3xl font-black text-lg shadow-xl shadow-emerald-100">Cobrar Ahora</button>
          </div>
        </div>
      </div>
    </>
  )
}



