import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
  Mail,
  Lock,
  ChevronRight,
  Store,
  User,
  FileText,
  Phone
} from 'lucide-react';

export function Register(){

  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [ruc, setRuc] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate();

   async function registerUser(e){
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:8080/api/auth/registro",{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nombreEmpresa,ruc,telefono,correo,nombreUsuario,dni,password})
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      console.log("Registro exitoso", response);
      navigate('/login');

    } catch (error) {
      console.error(error);
      alert("Error al registrar: " + error.message);
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl shadow-slate-200 p-12">
        <Link to="/" className="text-slate-400 hover:text-emerald-600 flex items-center space-x-1 text-xs font-bold mb-8 uppercase tracking-widest transition-colors">
          <ChevronRight size={16} className="rotate-180" />
          <span>Volver al inicio</span>
        </Link>

        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-900">Registra tu Bodega</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Únete a la red de bodegas más moderna del país.</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={registerUser}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Bodega</label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
              type="text"
              placeholder="Ej: Bodega Don Lucho"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              onChange={(e)=>{setNombreEmpresa(e.target.value)}}
              required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RUC del Negocio</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
              type="number"
              placeholder="10XXXXXXXXX"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              onChange={(e)=>setRuc(e.target.value)}
              required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Propietario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
              type="text"
              placeholder="Tu nombre completo" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              onChange={(e)=>setNombreUsuario(e.target.value)}
              required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DNI del Propietario</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
              type="number"
              placeholder="DNI (8 dígitos)" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              onChange={(e)=>setDni(e.target.value)}
              required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
              type="number"
              placeholder="999 999 999"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              onChange={(e)=>setTelefono(e.target.value)}
              required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
              type="email"
              placeholder="contacto@bodega.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              onChange={(e)=>setCorreo(e.target.value)}
              required
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crea una Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
              type="password"
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              onChange={(e)=>setPassword(e.target.value)}
              required
              minLength={8}
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98]">
              Crear mi Cuenta de Negocio
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-slate-400 mt-8">
          ¿Ya tienes una bodega registrada? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  )
}