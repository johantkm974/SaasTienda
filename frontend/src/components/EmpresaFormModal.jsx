import { useState } from 'react';
import { X, Building2, FileText, Phone, Image, PlusCircle, Save } from 'lucide-react';

export function EmpresaFormModal({ isOpen, onClose, onSave, empresa, guardando }) {
  const [formData, setFormData] = useState({
    nombreComercial: empresa?.nombreComercial || '',
    ruc: empresa?.ruc || '',
    telefono: empresa?.telefono || '',
    logoUrl: empresa?.logoUrl || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{empresa ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Administración del SaaS</p>
          </div>
          <button onClick={onClose} className="cursor-pointer p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors shadow-sm">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Ej: TechStore Peru"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.nombreComercial}
                  onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RUC</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="20600011122"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="987654321"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                URL del Logo <span className="normal-case font-bold">(opcional)</span>
              </label>
              <div className="relative">
                <Image className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm cursor-pointer hover:bg-slate-200 transition-all">Cancelar</button>
            <button type="submit" disabled={guardando} className="cursor-pointer flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center space-x-2 disabled:opacity-50">
              {empresa ? <Save size={18} /> : <PlusCircle size={18} />}
              <span>{guardando ? 'Guardando...' : empresa ? 'Guardar Cambios' : 'Crear Empresa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
