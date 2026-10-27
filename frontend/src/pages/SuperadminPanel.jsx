import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Ban,
  Wallet,
  Users,
  BarChart3,
  Trophy,
  Store,
  TrendingUp,
  Plus,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '../api';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmpresaFormModal } from '../components/EmpresaFormModal';
import { EmpresaDetalleModal } from '../components/EmpresaDetalleModal';

export default function SuperadminPanel() {
  const [empresas, setEmpresas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cambiando, setCambiando] = useState(null);
  const [formModal, setFormModal] = useState({ open: false, editando: null });
  const [detalleEmpresa, setDetalleEmpresa] = useState(null);
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const [empresasData, ventasData, usuariosData] = await Promise.all([
          apiFetch('/api/empresas'),
          apiFetch('/api/ventas/paginado?page=0&size=100'),
          apiFetch('/api/usuarios/todos'),
        ]);
        if (!activo) return;
        setEmpresas(empresasData || []);
        setVentas((ventasData?.content || []).map((v) => ({
          ...v,
          totalVenta: Number(v.totalVenta || 0),
        })));
        setUsuarios(usuariosData || []);
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => { activo = false; };
  }, []);

  const recargar = async () => {
    try {
      const [empresasData, ventasData, usuariosData] = await Promise.all([
        apiFetch('/api/empresas'),
        apiFetch('/api/ventas/paginado?page=0&size=100'),
        apiFetch('/api/usuarios/todos'),
      ]);
      setEmpresas(empresasData || []);
      setVentas((ventasData?.content || []).map((v) => ({
        ...v,
        totalVenta: Number(v.totalVenta || 0),
      })));
      setUsuarios(usuariosData || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const guardarEmpresa = async (formData) => {
    setGuardando(true);
    setError('');
    try {
      if (formModal.editando) {
        const actualizada = await apiFetch(`/api/empresas/${formModal.editando.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...formData,
            estado: formModal.editando.estado,
          }),
        });
        setEmpresas((prev) => prev.map((e) => (e.id === actualizada.id ? actualizada : e)));
      } else {
        const creada = await apiFetch('/api/empresas', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setEmpresas((prev) => [...prev, creada]);
      }
      setFormModal({ open: false, editando: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarEmpresa = async () => {
    setEliminando(true);
    setError('');
    try {
      await apiFetch(`/api/empresas/${empresaAEliminar.id}`, { method: 'DELETE' });
      setEmpresas((prev) => prev.filter((e) => e.id !== empresaAEliminar.id));
      setUsuarios((prev) => prev.filter((u) => u.empresa?.id !== empresaAEliminar.id));
      setEmpresaAEliminar(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  };

  const cambiarEstado = async (empresa, nuevoEstado) => {
    setCambiando(empresa.id);
    setError('');
    try {
      const actualizada = await apiFetch(`/api/empresas/${empresa.id}/estado?estado=${nuevoEstado}`, { method: 'PUT' });
      setEmpresas((prev) => prev.map((e) => (e.id === empresa.id ? actualizada : e)));
    } catch (err) {
      setError(err.message);
    } finally {
      setCambiando(null);
    }
  };

  const activas = empresas.filter((e) => e.estado === 'ACTIVO').length;
  const suspendidas = empresas.length - activas;
  const totalVentas = ventas.reduce((suma, v) => suma + v.totalVenta, 0);
  const ventasMes = ventas.length;

  const statsPorEmpresa = useMemo(() => {
    const mapa = new Map();
    empresas.forEach((e) => mapa.set(e.id, { empresa: e, ventas: 0, monto: 0, usuarios: 0 }));
    ventas.forEach((v) => {
      const id = v.empresa?.id;
      if (!id || !mapa.has(id)) return;
      const s = mapa.get(id);
      s.ventas += 1;
      s.monto += v.totalVenta;
    });
    usuarios.forEach((u) => {
      const id = u.empresa?.id;
      if (!id || !mapa.has(id)) return;
      mapa.get(id).usuarios += 1;
    });
    return [...mapa.values()];
  }, [empresas, ventas, usuarios]);

  const ranking = useMemo(
    () => [...statsPorEmpresa].sort((a, b) => b.monto - a.monto).slice(0, 3),
    [statsPorEmpresa]
  );

  const ventasPorMes = useMemo(() => {
    const acum = {};
    ventas.forEach((v) => {
      if (!v.fecha) return;
      const mes = new Date(v.fecha).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      acum[mes] = (acum[mes] || 0) + v.totalVenta;
    });
    return Object.entries(acum);
  }, [ventas]);

  const maxMes = Math.max(1, ...ventasPorMes.map(([, m]) => m));

  const MEDALLAS = ['bg-amber-100 text-amber-600', 'bg-slate-200 text-slate-600', 'bg-orange-100 text-orange-600'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel del Superadministrador</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Controla todas las empresas del SaaS (BodegaControl)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFormModal({ open: true, editando: null })}
            className="cursor-pointer flex items-center space-x-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
          >
            <Plus size={18} />
            <span>Nueva Empresa</span>
          </button>
          <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest w-max">
            Rol SUPREMO
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Building2 size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas Activas</p>
            <p className="text-2xl font-black text-slate-900">{activas}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Ban size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas Suspendidas</p>
            <p className="text-2xl font-black text-slate-900">{suspendidas}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Wallet size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ventas Totales del Sistema</p>
            <p className="text-2xl font-black text-slate-900">S/ {totalVentas.toFixed(2)}</p>
            <p className="text-[10px] font-bold text-slate-400">{ventasMes} ventas</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Users size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuarios en todo el SaaS</p>
            <p className="text-2xl font-black text-slate-900">{usuarios.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center space-x-2 bg-slate-50/30">
            <BarChart3 size={20} className="text-emerald-600" />
            <h3 className="font-black text-slate-800">Ventas por Mes (todo el SaaS)</h3>
          </div>
          <div className="p-8">
            {cargando ? (
              <p className="text-sm text-slate-400 font-medium">Cargando...</p>
            ) : ventasPorMes.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">Aún no hay ventas registradas</p>
            ) : (
              <div className="space-y-4">
                {ventasPorMes.map(([mes, total]) => (
                  <div key={mes} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 capitalize w-36">{mes}</span>
                    <div className="flex-1 mx-4 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (total / maxMes) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-slate-900 w-28 text-right">S/ {total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center space-x-2 bg-slate-50/30">
            <Trophy size={20} className="text-amber-500" />
            <h3 className="font-black text-slate-800">Top Empresas por Recaudación</h3>
          </div>
          <div className="p-8 space-y-4">
            {cargando ? (
              <p className="text-sm text-slate-400 font-medium">Cargando...</p>
            ) : ranking.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">Aún no hay datos</p>
            ) : (
              ranking.map((s, i) => (
                <div key={s.empresa.id} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${MEDALLAS[i]}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{s.empresa.nombreComercial}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.ventas} ventas</p>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">S/ {s.monto.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center space-x-2 bg-slate-50/30">
          <Store size={20} className="text-emerald-600" />
          <h3 className="font-black text-slate-800">Empresas registradas</h3>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando empresas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                <tr>
                  <th className="py-5 px-8">Empresa</th>
                  <th className="py-5 px-4">RUC</th>
                  <th className="py-5 px-4 text-center">Usuarios</th>
                  <th className="py-5 px-4 text-center">Ventas</th>
                  <th className="py-5 px-4 text-right">Recaudado</th>
                  <th className="py-5 px-4">Estado</th>
                  <th className="py-5 px-8 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {statsPorEmpresa.map((s) => (
                  <tr key={s.empresa.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                          <Store size={18} />
                        </div>
                        <span className="font-bold text-slate-800">{s.empresa.nombreComercial}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 font-bold">{s.empresa.ruc}</td>
                    <td className="py-4 px-4 text-center text-slate-600">{s.usuarios}</td>
                    <td className="py-4 px-4 text-center text-slate-600">{s.ventas}</td>
                    <td className="py-4 px-4 text-right font-black text-emerald-700">S/ {s.monto.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${
                          s.empresa.estado === 'ACTIVO'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {s.empresa.estado}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setDetalleEmpresa(s.empresa)}
                          className="cursor-pointer p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setFormModal({ open: true, editando: s.empresa })}
                          className="cursor-pointer p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Editar empresa"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setEmpresaAEliminar(s.empresa)}
                          className="cursor-pointer p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Eliminar empresa"
                        >
                          <Trash2 size={16} />
                        </button>
                        {s.empresa.estado === 'ACTIVO' ? (
                          <button
                            onClick={() => cambiarEstado(s.empresa, 'SUSPENDIDO')}
                            disabled={cambiando === s.empresa.id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                          >
                            {cambiando === s.empresa.id ? '...' : 'Suspender'}
                          </button>
                        ) : (
                          <button
                            onClick={() => cambiarEstado(s.empresa, 'ACTIVO')}
                            disabled={cambiando === s.empresa.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {cambiando === s.empresa.id ? '...' : 'Activar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {statsPorEmpresa.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 px-8 text-center text-slate-400">
                      No hay empresas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-xs font-bold text-slate-300 flex items-center justify-center space-x-2">
        <TrendingUp size={14} />
        <span>BodegaControl SaaS · Datos en tiempo real</span>
      </p>

      <EmpresaFormModal
        isOpen={formModal.open}
        empresa={formModal.editando}
        onClose={() => setFormModal({ open: false, editando: null })}
        onSave={guardarEmpresa}
        guardando={guardando}
      />

      <EmpresaDetalleModal
        empresa={detalleEmpresa}
        ventas={ventas}
        onClose={() => setDetalleEmpresa(null)}
        onDatosCambiados={recargar}
      />

      <ConfirmModal
        isOpen={!!empresaAEliminar}
        titulo="Eliminar Empresa"
        mensaje={`¿Seguro que deseas eliminar "${empresaAEliminar?.nombreComercial}"? Se marcará como eliminada y desaparecerá del SaaS.`}
        onCancel={() => setEmpresaAEliminar(null)}
        onConfirm={eliminarEmpresa}
        confirmando={eliminando}
      />
    </div>
  );
}
