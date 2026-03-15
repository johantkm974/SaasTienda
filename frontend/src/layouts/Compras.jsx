import { useState } from 'react';
import { 
  Truck, 
  AlertTriangle,
  History,
  Filter,
  UserCheck,
  Info,
} from 'lucide-react';
import { ModalProducto } from '../components/ModalProducto';
import { useOutletContext } from 'react-router-dom';
import { AddPurchaseModal } from '../components/AddPurchaseModal';


export function Compras(){

  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false)
  const { categorias, agregarProducto } = useOutletContext()

    const [purchases, setPurchases] = useState([
    { id: 1, provider: "Alicorp S.A.A", date: "2024-03-10", total: 1240.50, status: "Recibido" },
    { id: 2, provider: "Nestlé Perú", date: "2024-03-12", total: 450.00, status: "Pendiente" },
  ]);


  return (
    <>
      <AddPurchaseModal 
        isOpen={isAddPurchaseModalOpen}
        onClose={() => setIsAddPurchaseModalOpen(false)}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Gestión de Compras
          </h1>
          <p className="text-slate-500 text-sm">
            Gestiona tu bodega en tiempo real.
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAddPurchaseModalOpen(true)}
            className="cursor-pointer bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 shadow-xl hover:bg-emerald-700 transition-all shadow-emerald-100">
            <Truck size={18} />
            <span>Registrar Compra</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Truck size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto Total Mes</p>
              <p className="text-2xl font-black text-slate-900">S/ 12,450.20</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedidos Pendientes</p>
              <p className="text-2xl font-black text-slate-900">03 Pedidos</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><UserCheck size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedores Activos</p>
              <p className="text-2xl font-black text-slate-900">12 Empresas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <History size={20} className="text-emerald-600" />
              <span>Historial de Abastecimiento</span>
            </h3>
            <div className="flex space-x-2">
              <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors"><Filter size={18}/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                <tr>
                  <th className="py-5 px-8">Proveedor</th>
                  <th className="py-5 px-4">Fecha</th>
                  <th className="py-5 px-4 text-right">Monto Total</th>
                  <th className="py-5 px-4">Estado</th>
                  <th className="py-5 px-8 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchases.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                          <Truck size={18} />
                        </div>
                        <span className="font-bold text-slate-800">{p.provider}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-xs text-slate-500 font-medium">{p.date}</td>
                    <td className="py-5 px-4 text-right font-black text-slate-900">S/ {p.total.toFixed(2)}</td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        p.status === 'Recibido' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <button className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"><Info size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}