import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onPageChange, registros, total }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-400">
        Mostrando {registros} de {total} registros
      </p>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="cursor-pointer p-2 bg-slate-50 rounded-xl text-slate-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-bold text-slate-600 px-3">
          Página {page + 1} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="cursor-pointer p-2 bg-slate-50 rounded-xl text-slate-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
