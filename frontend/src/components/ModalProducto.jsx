import { useState } from "react";
import { 
  Package, 
  AlertTriangle,
  Wallet,
  X,
  Save,
  Tag,
  DollarSign,
  Layers
} from 'lucide-react';

export function ModalProducto({ isOpen, onClose, onSave , opcionesCategorias }){
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    minStock: '',
    price: '',
    cost: '',
    description: '',
    imgUrl: ''
  });

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData)
    // const token = JSON.parse(localStorage.getItem('token-user'))
    // if(!token){
    //   console.error("No se encontró el token de autenticación.")
    //   return
    // }

    // // Decodificamos el JWT para obtener el empresaId del payload
    // const payload = JSON.parse(atob(token.split('.')[1]));

    // try{
    //   const response = await fetch('http://localhost:8080/api/productos',{
    //     method: 'POST',
    //     headers: {
    //       'Authorization' : `Bearer ${token}`,
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       empresa: { id: payload.empresaId },
    //       nombre: formData.name,
    //       categoria: { id: parseInt(formData.category) },
    //       descripcion: formData.description,
    //       precioVenta: parseFloat(formData.price),
    //       stockActual: parseInt(formData.stock),
    //       imagenUrl: formData.imgUrl,
    //     //   minStock: parseInt(formData.minStock),
    //     //   cost: parseFloat(formData.cost)
    //     })
    //   });
    //   if (response.ok) {
    //   const data = await response.json();
    //   } else {
    //     const errorData = await response.text();
    //     console.error(`Error ${response.status}: ${errorData}`);
    //   }
    // }
    // catch(error){
    //   console.error("Error al guardar el producto:", error);
    // }
    onClose()
  };
  return (
 <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Nuevo Producto</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Registro de Almacén</p>
          </div>
          <button onClick={onClose} className=" cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Producto</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Ej: Aceite Primor 1L"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select  name="select"
                  placeholder="Seleccionar una categoría"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value={''}>Selecionar una categoria:</option>
                  {opcionesCategorias.map((c)=>{
                    return <option key={c.id} value={c.id}>{c.nombre}</option>
                  })}
                </select>
              </div>
            </div>

            {/* Costo de Compra */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Costo de Compra (S/)</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  // required 
                />
              </div>
            </div>

            {/* Precio de Venta */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Precio de Venta (S/)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-700"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Stock Inicial */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Inicial</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Stock Mínimo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alerta Stock Mínimo</label>
              <div className="relative">
                <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  placeholder="5"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  // required 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex space-x-4">
            <button 
              onClick={onClose}
              className="cursor-pointer flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="cursor-pointer flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>Guardar Producto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}