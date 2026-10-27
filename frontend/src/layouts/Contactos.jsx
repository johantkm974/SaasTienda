import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Plus,
  Users,
  Truck,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { AddProveedor } from '../components/AddProveedor';
import { AddUsuarioModal } from '../components/AddUsuarioModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { getRolFromToken } from '../api';

const TABS = [
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'vendedores', label: 'Vendedores', icon: Users },
];

export function Contactos(){
  const {
    proveedores,
    usuarios,
    addProveedor,
    addUsuario,
    actualizarProveedor,
    eliminarProveedor,
    actualizarUsuario,
    eliminarUsuario,
  } = useOutletContext()

  const esVendedor = getRolFromToken() === 'VENDEDOR';

  const [tab, setTab] = useState('proveedores')
  const [proveedorModal, setProveedorModal] = useState({ open: false, editando: null })
  const [usuarioModal, setUsuarioModal] = useState({ open: false, editando: null, rolId: 3, titulo: 'Cliente' })
  const [guardando, setGuardando] = useState(false)
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  if (esVendedor) return <Navigate to="/dashboard" replace />;

  const clientes = (usuarios || []).filter(u => u.rol && u.rol.nombre === 'Cliente')
  const vendedores = (usuarios || []).filter(u => u.rol && u.rol.nombre === 'Vendedor')

  const guardarProveedor = async (formData) => {
    setGuardando(true);
    try {
      const payload = {
        nombre: formData.nombre,
        identificacion: formData.identificacion,
        telefono: formData.telefono,
        correo: formData.correo,
      };
      if (proveedorModal.editando) {
        await actualizarProveedor(proveedorModal.editando.id, payload);
      } else {
        await addProveedor(payload);
      }
      setProveedorModal({ open: false, editando: null });
    } catch (error) {
      alert('Error al guardar proveedor: ' + error.message);
    } finally {
      setGuardando(false);
    }
  }

  const guardarUsuario = async (formData) => {
    setGuardando(true);
    try {
      const payload = {
        nombre: formData.nombre,
        dni: formData.dni,
        correo: formData.correo,
        ...(formData.contrasena ? { contrasena: formData.contrasena } : {}),
        rol: { id: usuarioModal.rolId }
      };
      if (usuarioModal.editando) {
        await actualizarUsuario(usuarioModal.editando.id, payload);
      } else {
        await addUsuario(payload);
      }
      setUsuarioModal({ open: false, editando: null, rolId: 3, titulo: 'Cliente' });
    } catch (error) {
      alert('Error al guardar usuario: ' + error.message);
    } finally {
      setGuardando(false);
    }
  }

  const confirmarEliminarProveedor = async () => {
    setEliminando(true);
    try {
      await eliminarProveedor(proveedorAEliminar.id);
      setProveedorAEliminar(null);
    } catch (error) {
      alert('Error al eliminar proveedor: ' + error.message);
    } finally {
      setEliminando(false);
    }
  }

  const confirmarEliminarUsuario = async () => {
    setEliminando(true);
    try {
      await eliminarUsuario(usuarioAEliminar.id);
      setUsuarioAEliminar(null);
    } catch (error) {
      alert('Error al eliminar usuario: ' + error.message);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <>
      <AddProveedor
        key={proveedorModal.editando?.id ?? 'nuevo'}
        isOpen={proveedorModal.open}
        onClose={() => setProveedorModal({ open: false, editando: null })}
        onSave={guardarProveedor}
        proveedor={proveedorModal.editando}
        guardando={guardando}
      />
      <AddUsuarioModal
        key={usuarioModal.editando?.id ?? 'nuevo'}
        isOpen={usuarioModal.open}
        onClose={() => setUsuarioModal({ open: false, editando: null, rolId: 3, titulo: 'Cliente' })}
        onSave={guardarUsuario}
        usuario={usuarioModal.editando}
        titulo={usuarioModal.titulo}
        guardando={guardando}
      />
      <ConfirmModal
        isOpen={!!proveedorAEliminar}
        titulo="Eliminar proveedor"
        mensaje={`¿Seguro que deseas eliminar "${proveedorAEliminar?.nombre}"?`}
        onCancel={() => setProveedorAEliminar(null)}
        onConfirm={confirmarEliminarProveedor}
        confirmando={eliminando}
      />
      <ConfirmModal
        isOpen={!!usuarioAEliminar}
        titulo={`Eliminar ${usuarioAEliminar?.rol?.nombre || 'usuario'}`}
        mensaje={`¿Seguro que deseas eliminar a "${usuarioAEliminar?.nombre}"?`}
        onCancel={() => setUsuarioAEliminar(null)}
        onConfirm={confirmarEliminarUsuario}
        confirmando={eliminando}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Contactos
          </h1>
          <p className="text-slate-500 text-sm">
            Gestiona tus proveedores, clientes y vendedores.
          </p>
        </div>
        <div className="flex space-x-3">
          {tab === 'proveedores' && (
            <button
              className="cursor-pointer bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center space-x-2 hover:bg-emerald-700"
              onClick={() => setProveedorModal({ open: true, editando: null })}
            >
              <Truck size={18} />
              <span>Añadir Proveedor</span>
            </button>
          )}
          {tab === 'clientes' && (
            <button
              className="cursor-pointer bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center space-x-2 hover:bg-emerald-700"
              onClick={() => setUsuarioModal({ open: true, editando: null, rolId: 3, titulo: 'Cliente' })}
            >
              <Plus size={18} />
              <span>Nuevo Cliente</span>
            </button>
          )}
          {tab === 'vendedores' && (
            <button
              className="cursor-pointer bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center space-x-2 hover:bg-emerald-700"
              onClick={() => setUsuarioModal({ open: true, editando: null, rolId: 2, titulo: 'Vendedor' })}
            >
              <Plus size={18} />
              <span>Nuevo Vendedor</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
              tab === id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'proveedores' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedores</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{proveedores.length}</h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Truck size={24}/></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <tr>
                  <th className="py-5 px-8">Empresa</th>
                  <th className="py-5 px-8">RUC</th>
                  <th className="py-5 px-4 text-center">Teléfono</th>
                  <th className="py-5 px-4 text-right">Correo</th>
                  <th className="py-5 px-8 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {proveedores.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No hay proveedores registrados</td></tr>
                ) : (
                  proveedores.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-8 font-bold text-slate-800">{p.nombre}</td>
                      <td className="py-4 px-8 font-bold text-slate-800">{p.identificacion}</td>
                      <td className="py-4 px-4 text-center">{p.telefono || '—'}</td>
                      <td className="py-4 px-4 text-right">{p.correo || '—'}</td>
                      <td className="py-4 px-8 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg transition-colors" title="Editar"
                            onClick={() => setProveedorModal({ open: true, editando: p })}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg transition-colors" title="Eliminar"
                            onClick={() => setProveedorAEliminar(p)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'clientes' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clientes</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{clientes.length}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users size={24}/></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <tr>
                  <th className="py-5 px-8">Nombre</th>
                  <th className="py-5 px-8">DNI</th>
                  <th className="py-5 px-4 text-right">Correo</th>
                  <th className="py-5 px-8 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clientes.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No hay clientes registrados</td></tr>
                ) : (
                  clientes.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-8 font-bold text-slate-800">{u.nombre}</td>
                      <td className="py-4 px-8 text-slate-600">{u.dni}</td>
                      <td className="py-4 px-4 text-right">{u.correo}</td>
                      <td className="py-4 px-8 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg transition-colors" title="Editar"
                            onClick={() => setUsuarioModal({ open: true, editando: u, rolId: 3, titulo: 'Cliente' })}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg transition-colors" title="Eliminar"
                            onClick={() => setUsuarioAEliminar(u)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'vendedores' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendedores</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{vendedores.length}</h3>
                </div>
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Users size={24}/></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <tr>
                  <th className="py-5 px-8">Nombre</th>
                  <th className="py-5 px-8">DNI</th>
                  <th className="py-5 px-4 text-right">Correo</th>
                  <th className="py-5 px-8 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vendedores.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No hay vendedores registrados</td></tr>
                ) : (
                  vendedores.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-8 font-bold text-slate-800">{u.nombre}</td>
                      <td className="py-4 px-8 text-slate-600">{u.dni}</td>
                      <td className="py-4 px-4 text-right">{u.correo}</td>
                      <td className="py-4 px-8 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg transition-colors" title="Editar"
                            onClick={() => setUsuarioModal({ open: true, editando: u, rolId: 2, titulo: 'Vendedor' })}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg transition-colors" title="Eliminar"
                            onClick={() => setUsuarioAEliminar(u)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
