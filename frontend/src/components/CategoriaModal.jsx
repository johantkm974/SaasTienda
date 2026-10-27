import { useState } from 'react';
import { X, Tag, Save, Eye } from 'lucide-react';

export function CategoriaModal({ isOpen, onClose, onSave, categoria, guardando }) {
  const [formData, setFormData] = useState({
    nombre: categoria?.nombre || '',
    descripcion: categoria?.descripcion || '',
    visibleTienda: categoria?.visibleTienda ?? true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{categoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Organiza tu inventario</p>
          </div>
          <button onClick={onClose} className="cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Ej: Lácteos"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
            <textarea
              rows={3}
              placeholder="Descripción opcional"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 px-5">
            <div className="flex items-center space-x-3">
              <Eye className="text-emerald-500" size={18} />
              <div>
                <p className="text-sm font-bold text-slate-800">Visible en la tienda</p>
                <p className="text-xs text-slate-400 font-medium">Los productos de esta categoría se mostrarán en tu tienda online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, visibleTienda: !formData.visibleTienda })}
              className={`cursor-pointer relative w-14 h-8 rounded-full transition-colors ${formData.visibleTienda ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${formData.visibleTienda ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="pt-2 flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="cursor-pointer flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save size={18} />
              <span>{guardando ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
