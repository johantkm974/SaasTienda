import { 
  Truck, 
  Wallet,
  X,
  Calendar,
  PlusCircle   
} from 'lucide-react';
import { useState } from "react";

export function AddPurchaseModal({ isOpen, onClose, onSave }){
  const [formData, setFormData] = useState({
    provider: '',
    date: new Date().toISOString().split('T')[0],
    total: '',
    status: 'Recibido',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: Date.now(), total: parseFloat(formData.total) || 0 });
    setFormData({ provider: '', date: new Date().toISOString().split('T')[0], total: '', status: 'Recibido', notes: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
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
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  required
                >
                  <option value="">Selecciona un proveedor</option>
                  <option>Alicorp S.A.A</option>
                  <option>Nestlé Perú</option>
                  <option>Gloria S.A</option>
                  <option>Backus & Johnston</option>
                  <option>Distribuidora Mayorista</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Compra</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto Total (S/)</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    value={formData.total}
                    onChange={(e) => setFormData({...formData, total: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado del Pedido</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, status: 'Recibido'})}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.status === 'Recibido' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-100'}`}
                >
                  Ya Recibido
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, status: 'Pendiente'})}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.status === 'Pendiente' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-500 border-slate-100'}`}
                >
                  Pendiente
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm">Cancelar</button>
            <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center space-x-2">
              <PlusCircle size={18} />
              <span>Registrar Pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};