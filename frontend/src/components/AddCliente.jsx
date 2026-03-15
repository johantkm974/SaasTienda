import { 
  Truck, 
  Wallet,
  X,
  Calendar,
  PlusCircle   
} from 'lucide-react';
import { useState } from "react";
import { useOutletContext } from 'react-router-dom';

export function AddCliente({ isOpen, onClose}){
  const { addCliente } = useOutletContext();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    direccion: '',
    correo: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // addProveedor(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Registrar cliente</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Gestión de clientes</p>
          </div>
          <button onClick={onClose} className="cursor-pointer p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors shadow-sm ">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div className="space-y-4">

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombres: </label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ej: Riszart Daryl"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                    required
                  />
              </div>

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">apellidos:</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ej: Vergara Cajacuri"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                    required
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DNI del cliente: </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      placeholder='Ej: 87654321'
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      onChange={(e) => setFormData({...formData, dni: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">numero de celular: </label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      placeholder="Ej: 987-654-321"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none "
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">dirección de locación:</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ej: Mz. A Lt. 12 Urb. Las Flores"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    required
                  />
              </div>

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo electrónico:</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="Ej: example@correo.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                    required
                  />
              </div>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm cursor-pointer hover:bg-slate-200 transition-all">Cancelar</button>
            <button type="submit" className="cursor-pointer flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center space-x-2">
              <PlusCircle size={18} />
              <span>Registrar Proveedor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};