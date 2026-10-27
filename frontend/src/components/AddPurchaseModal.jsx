import { 
  Truck, 
  Wallet,
  X,
  Calendar,
  PlusCircle,
  Trash2,
  Package,
  FileText
} from 'lucide-react';
import { useState } from "react";
import { useOutletContext } from 'react-router-dom';

export function AddPurchaseModal({ isOpen, onClose, onSave }){
  const { proveedores, productos } = useOutletContext();

  const [formData, setFormData] = useState({
    proveedorId: '',
    numeroComprobante: '',
    detalles: [{ productoId: '', cantidad: '', costoUnitario: '' }]
  });

  if (!isOpen) return null;

  const actualizarDetalle = (index, campo, valor) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.map((d, i) => i === index ? { ...d, [campo]: valor } : d)
    });
  };

  const agregarDetalle = () => {
    setFormData({
      ...formData,
      detalles: [...formData.detalles, { productoId: '', cantidad: '', costoUnitario: '' }]
    });
  };

  const eliminarDetalle = (index) => {
    if (formData.detalles.length === 1) return;
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const detalles = formData.detalles.map(d => ({
      producto: { id: parseInt(d.productoId) },
      cantidad: parseInt(d.cantidad),
      costoUnitario: parseFloat(d.costoUnitario)
    }));

    const payload = {
      proveedor: { id: parseInt(formData.proveedorId) },
      numeroComprobante: formData.numeroComprobante || null,
      detalles
    };

    await onSave(payload);

    setFormData({
      proveedorId: '',
      numeroComprobante: '',
      detalles: [{ productoId: '', cantidad: '', costoUnitario: '' }]
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Registrar Compra</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Abastecimiento de Mercadería</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proveedor</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                  value={formData.proveedorId}
                  onChange={(e) => setFormData({...formData, proveedorId: e.target.value})}
                  required
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">N° Comprobante (opcional)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Ej: F001-000123"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.numeroComprobante}
                  onChange={(e) => setFormData({...formData, numeroComprobante: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Productos</h3>
                <button
                  type="button"
                  onClick={agregarDetalle}
                  className="cursor-pointer flex items-center space-x-1 text-emerald-600 text-xs font-bold hover:underline"
                >
                  <PlusCircle size={16} />
                  <span>Agregar producto</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.detalles.map((detalle, index) => (
                  <div key={index} className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto {index + 1}</label>
                      <button
                        type="button"
                        onClick={() => eliminarDetalle(index)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                        disabled={formData.detalles.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                        value={detalle.productoId}
                        onChange={(e) => actualizarDetalle(index, 'productoId', e.target.value)}
                        required
                      >
                        <option value="">Selecciona un producto</option>
                        {productos.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad</label>
                        <input 
                          type="number" 
                          min="1"
                          placeholder="0"
                          className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-4 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={detalle.cantidad}
                          onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Costo Unitario (S/)</label>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="number" 
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={detalle.costoUnitario}
                            onChange={(e) => actualizarDetalle(index, 'costoUnitario', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm">Cancelar</button>
            <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center space-x-2">
              <PlusCircle size={18} />
              <span>Registrar Compra</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
