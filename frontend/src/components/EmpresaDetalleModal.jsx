import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Store,
  Wallet,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Phone,
  FileText,
  CalendarDays,
} from 'lucide-react';
import { apiFetch } from '../api';
import { ConfirmModal } from './ConfirmModal';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: TrendingUp },
  { id: 'ventas', label: 'Ventas', icon: Wallet },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
];

const ROLES = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Vendedor' },
  { id: 3, nombre: 'Cliente' },
];

const ESTILO_INPUT = 'w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none';
const ICONO_INPUT = 'absolute left-4 top-1/2 -translate-y-1/2 text-slate-400';

function Campo({ icon: Icon, label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <Icon className={ICONO_INPUT} size={18} />
        <input
          type={type}
          placeholder={placeholder}
          className={ESTILO_INPUT}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={type === 'password' ? 8 : undefined}
        />
      </div>
    </div>
  );
}

function UserFormModal({ isOpen, onClose, onSave, usuario, empresaId, guardando }) {
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    dni: usuario?.dni || '',
    correo: usuario?.correo || '',
    contrasena: '',
    rolId: usuario?.rol?.id || 2,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-900">{usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          <button onClick={onClose} className="cursor-pointer p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>
        <form
          className="p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ ...formData, empresaId });
          }}
        >
          <Campo icon={Users} label="Nombre Completo" value={formData.nombre} onChange={(v) => setFormData({ ...formData, nombre: v })} placeholder="Ej: Juan Pérez" required />
          <Campo icon={FileText} label="DNI" value={formData.dni} onChange={(v) => setFormData({ ...formData, dni: v })} placeholder="87654321" required />
          <Campo icon={Wallet} label="Correo electrónico" type="email" value={formData.correo} onChange={(v) => setFormData({ ...formData, correo: v })} placeholder="usuario@empresa.com" required />
          <Campo
            icon={TrendingUp}
            label={usuario ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type="password"
            value={formData.contrasena}
            onChange={(v) => setFormData({ ...formData, contrasena: v })}
            placeholder="Mínimo 8 caracteres"
            required={!usuario}
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol</label>
            <select
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.rolId}
              onChange={(e) => setFormData({ ...formData, rolId: Number(e.target.value) })}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-sm cursor-pointer hover:bg-slate-200 transition-all">Cancelar</button>
            <button type="submit" disabled={guardando} className="cursor-pointer flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50">
              {guardando ? 'Guardando...' : usuario ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EmpresaDetalleModal({ empresa, ventas, onClose, onDatosCambiados }) {
  const [tab, setTab] = useState('resumen');
  const [productos, setProductos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [userModal, setUserModal] = useState({ open: false, editando: null });
  const [userAEliminar, setUserAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const empresaId = empresa?.id;

  useEffect(() => {
    if (empresaId == null) return;
    let activo = true;

    async function cargarTodo() {
      setCargando(true);
      setError('');
      try {
        const [productosData, comprasData, usuariosData] = await Promise.all([
          apiFetch(`/api/productos/empresa/${empresaId}`),
          apiFetch(`/api/compras/empresa/${empresaId}`),
          apiFetch(`/api/usuarios/empresa/${empresaId}`),
        ]);
        if (!activo) return;
        setProductos(productosData || []);
        setCompras(comprasData || []);
        setUsuarios(usuariosData || []);
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarTodo();
    return () => { activo = false; };
  }, [empresaId]);

  const ventasEmpresa = useMemo(
    () => (ventas || []).filter((v) => v.empresa?.id === empresaId),
    [ventas, empresaId]
  );

  if (!empresa) return null;

  const totalRecaudado = ventasEmpresa.reduce((s, v) => s + Number(v.totalVenta || 0), 0);
  const totalCompras = compras.reduce((s, c) => s + Number(c.totalCompra || 0), 0);
  const stockTotal = productos.reduce((s, p) => s + Number(p.stock || 0), 0);

  const guardarUsuario = async (formData) => {
    setGuardando(true);
    setError('');
    try {
      const payload = {
        nombre: formData.nombre,
        dni: formData.dni,
        correo: formData.correo,
        contrasena: formData.contrasena || undefined,
        rol: { id: formData.rolId },
        empresa: { id: formData.empresaId },
      };
      if (userModal.editando) {
        await apiFetch(`/api/usuarios/${userModal.editando.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/usuarios', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      const lista = await apiFetch(`/api/usuarios/empresa/${empresa.id}`);
      setUsuarios(lista || []);
      setUserModal({ open: false, editando: null });
      onDatosCambiados?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async () => {
    setGuardando(true);
    setError('');
    try {
      await apiFetch(`/api/usuarios/${userAEliminar.id}`, { method: 'DELETE' });
      setUsuarios((prev) => prev.filter((u) => u.id !== userAEliminar.id));
      setUserAEliminar(null);
      onDatosCambiados?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const Badge = ({ estado }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
      {estado}
    </span>
  );

  const StatCard = ({ icon: Icon, color, label, value, sub }) => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center space-x-4">
      <div className={`p-3 ${color} rounded-2xl`}><Icon size={20} /></div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-900 truncate">{value}</p>
        {sub && <p className="text-[10px] font-bold text-slate-400">{sub}</p>}
      </div>
    </div>
  );

  const EncabezadoTabla = ({ cols }) => (
    <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
      <tr>{cols.map((c) => <th key={c} className="py-4 px-6">{c}</th>)}</tr>
    </thead>
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Store size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{empresa.nombreComercial}</h2>
              <div className="flex items-center space-x-4 text-xs font-bold text-slate-400 mt-1">
                <span className="flex items-center space-x-1"><FileText size={13} /> {empresa.ruc}</span>
                {empresa.telefono && <span className="flex items-center space-x-1"><Phone size={13} /> {empresa.telefono}</span>}
                {empresa.fechaRegistro && (
                  <span className="flex items-center space-x-1">
                    <CalendarDays size={13} />
                    {new Date(empresa.fechaRegistro).toLocaleDateString('es-PE')}
                  </span>
                )}
                <Badge estado={empresa.estado} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors shadow-sm">
            <X size={24} />
          </button>
        </div>

        <div className="px-8 pt-6 flex space-x-2 shrink-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`cursor-pointer flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  tab === t.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-8 overflow-y-auto space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold">{error}</div>
          )}

          {cargando && tab !== 'resumen' && (
            <p className="text-sm text-slate-400 font-medium text-center py-10">Cargando...</p>
          )}

          {!cargando && tab === 'resumen' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Wallet} color="bg-emerald-50 text-emerald-600" label="Recaudado" value={`S/ ${totalRecaudado.toFixed(2)}`} sub={`${ventasEmpresa.length} ventas`} />
                <StatCard icon={Users} color="bg-violet-50 text-violet-600" label="Usuarios" value={usuarios.length} sub="del SaaS" />
                <StatCard icon={Package} color="bg-blue-50 text-blue-600" label="Productos" value={productos.length} sub={`${stockTotal} unidades en stock`} />
                <StatCard icon={ShoppingCart} color="bg-amber-50 text-amber-600" label="Compras" value={compras.length} sub={`S/ ${totalCompras.toFixed(2)} invertido`} />
              </div>
              {ventasEmpresa.length === 0 && (
                <div className="text-center text-slate-400 text-sm font-medium py-8">
                  Esta empresa aún no tiene ventas registradas
                </div>
              )}
            </>
          )}

          {!cargando && tab === 'ventas' && (
            <div className="overflow-x-auto rounded-3xl border border-slate-100">
              <table className="w-full text-left">
                <EncabezadoTabla cols={['ID', 'Fecha', 'Venta']} />
                <tbody className="divide-y divide-slate-50">
                  {ventasEmpresa.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-xs font-bold text-slate-400">#{v.id}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-700">
                        {new Date(v.fecha).toLocaleString('es-PE')}
                      </td>
                      <td className="py-4 px-6 text-sm font-black text-emerald-700">S/ {Number(v.totalVenta).toFixed(2)}</td>
                    </tr>
                  ))}
                  {ventasEmpresa.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-slate-400">Sin ventas registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && tab === 'productos' && (
            <div className="overflow-x-auto rounded-3xl border border-slate-100">
              <table className="w-full text-left">
                <EncabezadoTabla cols={['Producto', 'Categoría', 'Precio', 'Stock', 'Estado']} />
                <tbody className="divide-y divide-slate-50">
                  {productos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-bold text-slate-800">{p.nombre}</td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-500">{p.categoria?.nombre || '—'}</td>
                      <td className="py-4 px-6 text-sm font-black text-slate-900">S/ {Number(p.precio).toFixed(2)}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-600">{p.stock}</td>
                      <td className="py-4 px-6"><Badge estado={p.estado} /></td>
                    </tr>
                  ))}
                  {productos.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">Sin productos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && tab === 'compras' && (
            <div className="overflow-x-auto rounded-3xl border border-slate-100">
              <table className="w-full text-left">
                <EncabezadoTabla cols={['Comprobante', 'Proveedor', 'Fecha', 'Total']} />
                <tbody className="divide-y divide-slate-50">
                  {compras.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-xs font-bold text-slate-400">{c.numeroComprobante || `#${c.id}`}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-800">{c.proveedor?.nombre || '—'}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-600">{new Date(c.fecha).toLocaleString('es-PE')}</td>
                      <td className="py-4 px-6 text-sm font-black text-amber-700">S/ {Number(c.totalCompra).toFixed(2)}</td>
                    </tr>
                  ))}
                  {compras.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">Sin compras registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && tab === 'usuarios' && (
            <>
              <div className="flex justify-end">
                <button
                  onClick={() => setUserModal({ open: true, editando: null })}
                  className="cursor-pointer flex items-center space-x-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  <Plus size={16} />
                  <span>Nuevo Usuario</span>
                </button>
              </div>
              <div className="overflow-x-auto rounded-3xl border border-slate-100">
                <table className="w-full text-left">
                  <EncabezadoTabla cols={['Nombre', 'Correo', 'DNI', 'Rol', 'Acciones']} />
                  <tbody className="divide-y divide-slate-50">
                    {usuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 text-sm font-bold text-slate-800">{u.nombre}</td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-500">{u.correo}</td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-500">{u.dni || '—'}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                            {u.rol?.nombre || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setUserModal({ open: true, editando: u })}
                              className="cursor-pointer p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Editar"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => setUserAEliminar(u)}
                              className="cursor-pointer p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {usuarios.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400">Sin usuarios en esta empresa</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <UserFormModal
        isOpen={userModal.open}
        onClose={() => setUserModal({ open: false, editando: null })}
        onSave={guardarUsuario}
        usuario={userModal.editando}
        empresaId={empresa.id}
        guardando={guardando}
      />

      <ConfirmModal
        isOpen={!!userAEliminar}
        titulo="Eliminar Usuario"
        mensaje={`¿Seguro que deseas eliminar a ${userAEliminar?.nombre}?`}
        onCancel={() => setUserAEliminar(null)}
        onConfirm={eliminarUsuario}
        confirmando={guardando}
      />
    </div>
  );
}
