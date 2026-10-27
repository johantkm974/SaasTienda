import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  Search,
  Trash2,
} from 'lucide-react'
import { apiFetch } from '../api'

export function Ventas(){

  const {productos, usuarios, setProductos} = useOutletContext()

  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [metodoPago, setMetodoPago] = useState('Efectivo')
  const [cobrando, setCobrando] = useState(false)

  const total = cart.reduce((acc, item) => acc + (item.precioVenta * item.qty), 0);

  function addToCart(product) {
    setCart((prevCart)=>{
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

  function changeQty(productId, delta) {
    setCart((prevCart) =>
      prevCart
        .map(item => item.id === productId ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0)
    );
  }

  async function cobrar() {
    if (cart.length === 0) {
      alert('Agrega al menos un producto al ticket');
      return;
    }

    setCobrando(true);

    try {
      const body = {
        detalles: cart.map(item => ({
          producto: { id: item.id },
          cantidad: item.qty,
        })),
        metodoPago,
        estadoPago: 'PAGADO',
      };

      if (clienteId) {
        body.usuario = { id: parseInt(clienteId) };
      }

      const venta = await apiFetch('/api/ventas', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setProductos((prev) =>
        prev.map((p) => {
          const item = cart.find((c) => c.id === p.id);
          return item ? { ...p, stockActual: p.stockActual - item.qty } : p;
        })
      );

      setCart([]);
      setClienteId('');
      alert(`Venta registrada por S/ ${venta.totalVenta.toFixed(2)}`);
    } catch (error) {
      alert('Error al cobrar: ' + error.message);
    } finally {
      setCobrando(false);
    }
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const clientes = (usuarios || []).filter(u => u.rol && u.rol.nombre === 'Cliente');

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] animate-in fade-in zoom-in duration-300">
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-3">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {productosFiltrados.map(p => (
              <button key={p.id}
                onClick={()=>addToCart(p)}
                disabled={p.stockActual <= 0}
                className="cursor-pointer bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group disabled:opacity-40 disabled:cursor-not-allowed">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-3 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <Package size={24} />
                </div>
                <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{p.nombre}</p>
                <p className="text-emerald-600 font-black text-sm">S/ {Number(p.precioVenta).toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{p.stockActual} en stock</p>
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
            {cart.length === 0 && (
              <p className="text-sm text-slate-400 font-medium">El ticket está vacío. Agrega productos.</p>
            )}
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{item.nombre}</p>
                  <p className="text-xs text-slate-400">S/ {Number(item.precioVenta).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-3 bg-slate-50 rounded-xl p-1 font-bold text-xs text-slate-700">
                  <button onClick={() => changeQty(item.id, -1)} className="px-2 hover:text-rose-500">-</button>
                  <span>{item.qty} u.</span>
                  <button onClick={() => changeQty(item.id, 1)} className="px-2 hover:text-emerald-600">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 bg-slate-50/50 space-y-4">
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Cliente anónimo</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <div className="flex justify-between items-center text-2xl font-black text-slate-900 border-t pt-4">
              <span>Total</span>
              <span className="text-emerald-600">S/ {total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMetodoPago('Efectivo')}
                className={`cursor-pointer p-3 border-2 rounded-2xl bg-white transition-all font-bold text-[10px] uppercase ${
                  metodoPago === 'Efectivo' ? 'border-emerald-500 text-emerald-600' : 'border-slate-100 text-slate-400 hover:border-emerald-500'
                }`}
              >Efectivo</button>
              <button
                onClick={() => setMetodoPago('Tarjeta')}
                className={`cursor-pointer p-3 border-2 rounded-2xl bg-white transition-all font-bold text-[10px] uppercase ${
                  metodoPago === 'Tarjeta' ? 'border-emerald-500 text-emerald-600' : 'border-slate-100 text-slate-400 hover:border-emerald-500'
                }`}
              >Tarjeta</button>
            </div>
            <button
              onClick={cobrar}
              disabled={cobrando || cart.length === 0}
              className="cursor-pointer w-full bg-emerald-600 text-white py-4 rounded-3xl font-black text-lg shadow-xl shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cobrando ? 'Procesando...' : 'Cobrar Ahora'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
