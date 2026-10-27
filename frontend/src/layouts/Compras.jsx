import { useEffect, useState } from 'react';
import { 
  Truck, 
  AlertTriangle,
  History,
  UserCheck,
  Info,
  X,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { AddPurchaseModal } from '../components/AddPurchaseModal';
import { Pagination } from '../components/Pagination';
import { apiFetch } from '../api';

const PAGE_SIZE = 10;

export function Compras(){

  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false)
  const { proveedores, setProductos } = useOutletContext()

  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [page, setPage] = useState(0)

  const [detalle, setDetalle] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  const cargarCompras = async () => {
    try {
      const data = await apiFetch('/api/compras');
      setCompras(data);
    } catch (error) {
      alert('Error al cargar compras: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCompras();
  }, []);

  const gastoTotal = compras.reduce((acc, c) => acc + Number(c.totalCompra || 0), 0);

  const verDetalle = async (id) => {
    setCargandoDetalle(true);
    setDetalle({ id });
    try {
      const data = await apiFetch(`/api/compras/${id}`);
      setDetalle(data);
    } catch (error) {
      alert('Error al cargar detalle: ' + error.message);
      setDetalle(null);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const guardarCompra = async (payload) => {
    setGuardando(true);
    try {
      const compra = await apiFetch('/api/compras', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setCompras((prev) => [compra, ...prev]);

      setProductos((prev) =>
        prev.map((p) => {
          const detalle = payload.detalles.find((d) => d.producto.id === p.id);
          return detalle ? { ...p, stockActual: p.stockActual + detalle.cantidad } : p;
        })
      );

      setIsAddPurchaseModalOpen(false);
      alert('Compra registrada correctamente');
    } catch (error) {
      alert('Error al registrar compra: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(compras.length / PAGE_SIZE));
  const paginaActual = Math.min(page, totalPaginas - 1);
  const comprasPagina = compras.slice(paginaActual * PAGE_SIZE, paginaActual * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <AddPurchaseModal 
        isOpen={isAddPurchaseModalOpen}
        onClose={() => setIsAddPurchaseModalOpen(false)}
        onSave={guardarCompra}
      />

      {detalle && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Detalle de Compra</h2>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">#C{detalle.id} · {detalle.fecha ? new Date(detalle.fecha).toLocaleDateString('es-PE') : ''}</p>
              </div>
              <button onClick={() => setDetalle(null)} className="cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              {cargandoDetalle ? (
                <p className="text-sm text-slate-400 font-medium">Cargando detalle...</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedor</p>
                      <p className="font-bold text-slate-800 mt-1">{detalle.proveedor?.nombre || '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comprobante</p>
                      <p className="font-bold text-slate-800 mt-1">{detalle.numeroComprobante || '—'}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                        <tr>
                          <th className="py-3 px-4">Producto</th>
                          <th className="py-3 px-4 text-center">Cantidad</th>
                          <th className="py-3 px-4 text-right">Costo Unit.</th>
                          <th className="py-3 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(detalle.detalleCompra || []).map((d) => (
                          <tr key={d.id}>
                            <td className="py-3 px-4 font-bold text-slate-800">{d.producto?.nombre || '—'}</td>
                            <td className="py-3 px-4 text-center text-slate-600">{d.cantidad}</td>
                            <td className="py-3 px-4 text-right text-slate-600">S/ {Number(d.costoUnitario || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800">S/ {Number((d.cantidad || 0) * (d.costoUnitario || 0)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-emerald-50 rounded-2xl px-6 py-4 text-right">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Compra</p>
                      <p className="text-2xl font-black text-emerald-700">S/ {Number(detalle.totalCompra || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            disabled={guardando}
            className="cursor-pointer bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 shadow-xl hover:bg-emerald-700 transition-all shadow-emerald-100 disabled:opacity-50">
            <Truck size={18} />
            <span>{guardando ? 'Registrando...' : 'Registrar Compra'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Truck size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto Total</p>
              <p className="text-2xl font-black text-slate-900">S/ {gastoTotal.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compras Registradas</p>
              <p className="text-2xl font-black text-slate-900">{compras.length} Compras</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><UserCheck size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedores Activos</p>
              <p className="text-2xl font-black text-slate-900">{proveedores.length} Empresas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <History size={20} className="text-emerald-600" />
              <span>Historial de Abastecimiento</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                <tr>
                  <th className="py-5 px-8">Proveedor</th>
                  <th className="py-5 px-4">Fecha</th>
                  <th className="py-5 px-4 text-right">Monto Total</th>
                  <th className="py-5 px-8 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="4" className="py-8 text-center text-sm text-slate-400 font-medium">Cargando...</td></tr>
                ) : compras.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-sm text-slate-400 font-medium">Aún no hay compras registradas</td></tr>
                ) : (
                  comprasPagina.map((c) => (
                    <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                            <Truck size={18} />
                          </div>
                          <span className="font-bold text-slate-800">{c.proveedor?.nombre || '—'}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-xs text-slate-500 font-medium">{c.fecha ? new Date(c.fecha).toLocaleDateString('es-PE') : '—'}</td>
                      <td className="py-5 px-4 text-right font-black text-slate-900">S/ {Number(c.totalCompra || 0).toFixed(2)}</td>
                      <td className="py-5 px-8 text-right">
                        <button className="cursor-pointer p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Ver detalle"
                          onClick={() => verDetalle(c.id)}
                        >
                          <Info size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={paginaActual}
            totalPages={totalPaginas}
            onPageChange={setPage}
            registros={comprasPagina.length}
            total={compras.length}
          />
        </div>
      </div>
    </>
  )
}
