import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({ isOpen, titulo, mensaje, onCancel, onConfirm, confirmando }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={26} />
          </div>
          <h3 className="text-lg font-black text-slate-900">{titulo}</h3>
          <p className="text-sm text-slate-500 font-medium mt-2">{mensaje}</p>
        </div>
        <div className="px-8 pb-8 flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmando}
            className="cursor-pointer flex-1 bg-rose-500 text-white py-3 rounded-2xl font-bold text-sm shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50"
          >
            {confirmando ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
