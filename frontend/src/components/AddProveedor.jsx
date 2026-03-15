import { 
  Truck, 
  Wallet,
  X,
  Calendar,
  PlusCircle   
} from 'lucide-react';
import { useState } from "react";
import { useOutletContext } from 'react-router-dom';

export function AddProveedor({ isOpen, onClose}){
  const { addProveedor } = useOutletContext();

  const [formData, setFormData] = useState({
    nombre: '',
    identificacion: '',
    telefono: '',
    correo: '',
    contactPerson: '',
    contactPersonCell: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addProveedor(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Registrar Proveedor</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Gestión de Proveedores</p>
          </div>
          <button onClick={onClose} className="cursor-pointer p-2 rounded-full text-slate-400 transition-colors shadow-sm hover:bg-slate-200">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div className="space-y-4">

            <h2 className='bg-green-700/10 text-center uppercase rounded-2xl py-1 text-green-700 font-bold text-sm'>informacion de la empresa</h2>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Empresa</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ej: Alicorp S.A.A"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RUC de la empresa</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    placeholder='Ej: 20100100100'
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setFormData({...formData, identificacion: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">numero de la empresa</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    placeholder="Ej: (01) 234-5678"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none "
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <h2 className='bg-green-700/10 text-center uppercase rounded-2xl py-1 my-5 text-green-700 font-bold text-sm'> informacion del personal encargado</h2>

            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">personal encargado</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ej: Riszart Daryl"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    required
                  />
              </div>
          </div>
            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">numero de Celular</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    placeholder="Ej: 987 654 321"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none "
                    onChange={(e) => setFormData({...formData, contactPersonCell: e.target.value})}
                    required
                  />
                </div>
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