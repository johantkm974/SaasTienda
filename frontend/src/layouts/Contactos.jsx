import React, { useState } from 'react';
import {
  Plus,
  Users, // Se agregó Users que faltaba
  Info,
  Truck,
} from 'lucide-react';
import { ModalProducto } from '../components/ModalProducto';
import { useOutletContext } from 'react-router-dom';
import { AddProveedor } from '../components/AddProveedor';
import { AddCliente } from '../components/AddCliente';


export function Contactos(){
  const {proveedores} = useOutletContext()
  const [addProveedorOpen , setAddProveedorOpen] = useState(false)
  const [addClienteOpen , setAddClienteOpen] = useState(false)

  return (
    <>
      <AddCliente 
        isOpen={addClienteOpen}
        onClose={() => setAddClienteOpen(false)}
      />
      <AddProveedor 
        isOpen={addProveedorOpen}
        onClose={() => setAddProveedorOpen(false)}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Contactos
          </h1>
          <p className="text-slate-500 text-sm">
            Gestiona tus proveedores y clientes en tiempo real.
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="cursor-pointer bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center space-x-2  hover:bg-emerald-700"
            onClick={() => setAddProveedorOpen(true)}
          >
            <Truck size={18} />
            <span>Añadir Proveedor</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-600 p-8 rounded-4xl text-white flex flex-col justify-between shadow-xl shadow-emerald-100 relative overflow-hidden">
            <h3 className="text-2xl font-black relative z-10">Registrar Cliente</h3>
            <button 
              className="cursor-pointer mt-8 bg-white text-emerald-600 px-6 py-3 rounded-2xl font-black text-sm w-max z-10 hover:bg-slate-200 transition-colors"
              onClick={() => setAddClienteOpen(true)}
            >
              Nuevo Cliente
            </button>
            <Plus size={100} className="absolute -bottom-4 -right-4 opacity-10" />
          </div>
          <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clientes</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">24</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Users size={24}/> 
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedores</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{proveedores.length}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Users size={24}/></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
              <tr>
                <th className="py-5 px-8">Empresa</th>
                <th className="py-5 px-8">RUC</th>
                <th className="py-5 px-4 text-center">Encargado</th>
                <th className="py-5 px-4 text-right">Número de Contacto</th>
                <th className="py-5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {proveedores.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-8 font-bold text-slate-800">{p.nombre}</td>
                  <td className="py-4 px-8 font-bold text-slate-800">{p.identificacion}</td>
                  <td className="py-4 px-4 text-center">{p.contactPerson}</td>
                  <td className="py-4 px-4 text-right font-black">{p.contactPersonCell}</td>
                  <td className="py-4 px-8 text-right"><Info size={18} className="text-slate-300 ml-auto cursor-pointer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}