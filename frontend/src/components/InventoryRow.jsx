import { Plus } from 'lucide-react';

export function InventoryRow({ name, category, stock, price, status }){
  return (
    <tr className="group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 text-sm">
      <td className="py-4 px-4 font-semibold text-slate-800">{name}</td>
      <td className="py-4 px-4 text-slate-500">{category}</td>
      <td className="py-4 px-4 font-medium">{stock} u.</td>
      <td className="py-4 px-4 font-bold text-slate-700">S/ {price.toFixed(2)}</td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
          status === 'Disponible' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
          status === 'Bajo Stock' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
          'bg-rose-50 text-rose-600 border-rose-100'
        }`}>
          {status}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <button className="text-slate-400 hover:text-emerald-600 transition-colors">
          <Plus size={18} />
        </button>
      </td>
    </tr>
  )
}