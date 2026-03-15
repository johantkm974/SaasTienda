import { 
  Trash2,
} from 'lucide-react';
export function DeleteModalProducto({ isOpen, onClose, onConfirm, p }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mb-4">
            <Trash2 className="h-6 w-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">¿Estás seguro?</h2>
          <p className="text-slate-500 text-sm mt-2">
            Vas a eliminar permanentemente el producto: <br/>
            <span className="font-bold text-slate-800">{p?.nombre}</span>
          </p>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
          >
            No, cancelar
          </button>
          <button 
            onClick={onConfirm} // <--- EJECUTAMOS LA FUNCIÓN DE BORRADO
            className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}