import { useCallback, useEffect, useState } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Wallet,
  Filter,
  HandCoins,
  Ban,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../api';

export function Reportes(){
  const [ventas, setVentas] = useState([])
  const [totalVentas, setTotalVentas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const cargarVentas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '0', size: '100' });
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      const data = await apiFetch(`/api/ventas/paginado?${params.toString()}`);
      setVentas(data.content || []);
      setTotalVentas(data.totalElements || 0);
    } catch (error) {
      alert('Error al cargar reportes: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const totalMonto = ventas.reduce((acc, v) => acc + Number(v.totalVenta || 0), 0);

  const ventasPorMes = ventas.reduce((acc, v) => {
    if (!v.fecha) return acc;
    const mes = new Date(v.fecha).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    acc[mes] = (acc[mes] || 0) + Number(v.totalVenta || 0);
    return acc;
  }, {});

  const pendientesCobro = ventas.filter(v => v.estadoPago === 'PENDIENTE_COBRO');

  async function marcarCobrada(id) {
    try {
      await apiFetch(`/api/ventas/${id}/cobrar`, { method: 'POST' });
      cargarVentas();
    } catch (error) {
      alert('Error al registrar el cobro: ' + error.message);
    }
  }

  async function cancelarPedido(id) {
    if (!confirm('¿Cancelar este pedido? Se devolverá el stock reservado.')) return;
    try {
      await apiFetch(`/api/ventas/${id}/cancelar`, { method: 'POST' });
      cargarVentas();
    } catch (error) {
      alert('Error al cancelar el pedido: ' + error.message);
    }
  }

  const aplicarFiltro = (e) => {
    e.preventDefault();
    cargarVentas();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reportes</h1>
        <p className="text-slate-500 text-sm">Resumen de tus ventas registradas.</p>
      </div>

      <form onSubmit={aplicarFiltro} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-end gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="bg-slate-50 border-none rounded-xl py-2.5 px-4 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="bg-slate-50 border-none rounded-xl py-2.5 px-4 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg shadow-slate-200"
        >
          <Filter size={16} />
          <span>Filtrar</span>
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Wallet size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total en Ventas</p>
            <p className="text-2xl font-black text-slate-900">S/ {totalMonto.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><TrendingUp size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ventas Registradas</p>
            <p className="text-2xl font-black text-slate-900">{totalVentas} Ventas</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center space-x-2 bg-slate-50/30">
          <BarChart3 size={20} className="text-emerald-600" />
          <h3 className="font-black text-slate-800">Ventas por Mes</h3>
        </div>
        <div className="p-8">
          {loading ? (
            <p className="text-sm text-slate-400 font-medium">Cargando...</p>
          ) : Object.keys(ventasPorMes).length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">Aún no hay ventas en el rango seleccionado</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(ventasPorMes).map(([mes, total]) => (
                <div key={mes} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 capitalize">{mes}</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (total / totalMonto) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-slate-900">S/ {total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center space-x-2 bg-slate-50/30">
          <HandCoins size={20} className="text-orange-500" />
          <h3 className="font-black text-slate-800">Pedidos por cobrar (contra entrega)</h3>
          {pendientesCobro.length > 0 && (
            <span className="ml-auto bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full">
              {pendientesCobro.length} pendiente(s)
            </span>
          )}
        </div>
        <div className="p-8">
          {loading ? (
            <p className="text-sm text-slate-400 font-medium">Cargando...</p>
          ) : pendientesCobro.length === 0 ? (
            <div className="flex items-center space-x-2 text-sm text-slate-400 font-medium">
              <RefreshCw size={14} />
              <span>No hay pedidos pendientes de cobro.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {pendientesCobro.map((v) => (
                <div key={v.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
                  <div>
                    <p className="text-sm font-black text-slate-800">Pedido #{v.id}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {v.cliente?.nombres ? `${v.cliente.nombres} ${v.cliente.apellidos || ''}` : 'Cliente anónimo'}
                      {v.fecha ? ` · ${new Date(v.fecha).toLocaleString('es-PE')}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {v.metodoPago || 'CONTADO'} · {v.estadoVenta === 'POR_COBRAR' ? 'Pendiente de cobro' : v.estadoVenta}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900">S/ {Number(v.totalVenta || 0).toFixed(2)}</span>
                    <button
                      onClick={() => marcarCobrada(v.id)}
                      className="cursor-pointer inline-flex items-center space-x-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                    >
                      <HandCoins size={14} />
                      <span>Cobrar</span>
                    </button>
                    <button
                      onClick={() => cancelarPedido(v.id)}
                      className="cursor-pointer inline-flex items-center space-x-1.5 bg-white border border-rose-200 text-rose-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-rose-50"
                    >
                      <Ban size={14} />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
