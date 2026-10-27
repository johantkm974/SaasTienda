import { useState, useEffect, useCallback } from 'react';
import { Truck, Package, MapPin, Search, RefreshCw } from 'lucide-react';
import { apiFetch } from '../api';

const ESTADOS = ['PREPARACION', 'EN_CAMINO', 'ENTREGADO'];
const ESTADO_LABEL = {
  PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
};
const ESTADO_COLOR = {
  PREPARACION: 'bg-amber-100 text-amber-700',
  EN_CAMINO: 'bg-blue-100 text-blue-700',
  ENTREGADO: 'bg-emerald-100 text-emerald-700',
};

export function Envios() {
  const [envios, setEnvios] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(null);
  const [editarId, setEditarId] = useState(null);
  const [draft, setDraft] = useState({ transportista: '', guiaTracking: '' });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await apiFetch(filtro === 'TODOS' ? '/api/envios' : `/api/envios/estado/${filtro}`);
      setEnvios(data || []);
    } catch (e) {
      alert('Error al cargar envíos: ' + e.message);
    } finally {
      setCargando(false);
    }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  async function cambiarEstado(id, estado) {
    setGuardando(id);
    try {
      await apiFetch(`/api/envios/${id}/estado/${estado}`, { method: 'PUT' });
      cargar();
    } catch (e) {
      alert('Error al actualizar estado: ' + e.message);
    } finally {
      setGuardando(null);
    }
  }

  async function guardarTracking(id) {
    setGuardando(id);
    try {
      const body = {};
      if (draft.transportista) body.transportista = draft.transportista;
      if (draft.guiaTracking) body.guiaTracking = draft.guiaTracking;
      if (Object.keys(body).length === 0) { setEditarId(null); return; }
      await apiFetch(`/api/envios/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      setEditarId(null);
      setDraft({ transportista: '', guiaTracking: '' });
      cargar();
    } catch (e) {
      alert('Error al guardar: ' + e.message);
    } finally {
      setGuardando(null);
    }
  }

  const filtrados = envios.filter((e) => {
    if (!buscar.trim()) return true;
    const q = buscar.toLowerCase();
    return (e.clienteNombre || '').toLowerCase().includes(q)
      || (e.guiaTracking || '').toLowerCase().includes(q)
      || (e.direccionEntrega || '').toLowerCase().includes(q);
  });

  const contadores = {
    TODOS: envios.length,
    PREPARACION: envios.filter((e) => e.estadoEnvio === 'PREPARACION').length,
    EN_CAMINO: envios.filter((e) => e.estadoEnvio === 'EN_CAMINO').length,
    ENTREGADO: envios.filter((e) => e.estadoEnvio === 'ENTREGADO').length,
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Envíos</h1>
          <p className="text-slate-500 text-sm">Seguimiento de pedidos con entrega a domicilio.</p>
        </div>
        <button onClick={cargar} className="inline-flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['TODOS', ...ESTADOS].map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filtro === e ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {ESTADO_LABEL[e] || 'Todos'} ({contadores[e] ?? 0})
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-3 mb-6">
        <Search size={20} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por cliente, dirección o guía..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
        />
      </div>

      {cargando ? (
        <p className="text-slate-400 text-sm">Cargando envíos...</p>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
          <Truck className="mx-auto text-slate-200 mb-3" size={48} />
          <p className="font-bold text-slate-600">No hay envíos{/* para mostrar */}</p>
          <p className="text-sm text-slate-400 mt-1">Los pedidos con dirección de entrega aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((env) => {
            const siguiente = ESTADOS[ESTADOS.indexOf(env.estadoEnvio) + 1];
            return (
              <div key={env.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-slate-900">Pedido #{env.ventaId}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {env.fechaVenta ? new Date(env.fechaVenta).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ESTADO_COLOR[env.estadoEnvio] || 'bg-amber-100 text-amber-700'}`}>
                    {ESTADO_LABEL[env.estadoEnvio] || env.estadoEnvio}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-bold text-slate-800 inline-flex items-center gap-1.5">
                    <Package size={14} className="text-slate-400" /> {env.clienteNombre || 'Cliente'}
                  </p>
                  {env.clienteTelefono && <p className="text-xs text-slate-500">{env.clienteTelefono}</p>}
                  <p className="text-xs text-slate-600 inline-flex items-start gap-1.5">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    {env.direccionEntrega}, {env.distrito}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-900">S/ {Number(env.totalVenta || 0).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">
                      Envío: {Number(env.costoEnvio || 0) > 0 ? `S/ ${Number(env.costoEnvio).toFixed(2)}` : 'GRATIS'} · {env.metodoPago}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${env.estadoPago === 'PAGADO' || env.estadoPago === 'PENDIENTE_COBRO' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {env.estadoPago}
                  </span>
                </div>

                {editarId === env.id ? (
                  <div className="mt-3 space-y-2">
                    <input
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Transportista (ej: Olva)"
                      value={draft.transportista}
                      onChange={(e) => setDraft({ ...draft, transportista: e.target.value })}
                    />
                    <input
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Guía / No. seguimiento"
                      value={draft.guiaTracking}
                      onChange={(e) => setDraft({ ...draft, guiaTracking: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => guardarTracking(env.id)} disabled={guardando === env.id}
                        className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 disabled:opacity-40">
                        {guardando === env.id ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button onClick={() => { setEditarId(null); setDraft({ transportista: '', guiaTracking: '' }); }}
                        className="px-4 bg-slate-100 text-slate-600 py-2 rounded-xl font-bold text-xs hover:bg-slate-200">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {env.transportista && (
                      <p className="mt-2 text-[11px] text-slate-500">Transportista: {env.transportista}</p>
                    )}
                    {env.guiaTracking && (
                      <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Guía/tracking: {env.guiaTracking}</p>
                    )}
                  </>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { setEditarId(env.id); setDraft({ transportista: env.transportista || '', guiaTracking: env.guiaTracking || '' }); }}
                    className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                  >
                    Transportista / Guía
                  </button>
                  {siguiente && (
                    <button
                      onClick={() => cambiarEstado(env.id, siguiente)}
                      disabled={guardando === env.id}
                      className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-700 disabled:opacity-40 transition-all"
                    >
                      {guardando === env.id ? 'Guardando...' : `Marcar: ${ESTADO_LABEL[siguiente]}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}