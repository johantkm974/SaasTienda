import { Link, useNavigate } from 'react-router-dom';
import { useState  } from 'react';
import { apiFetch, getRolFromToken, setToken } from '../api';

import { 
  Mail,
  Lock,
  ChevronRight,
  Store,
} from 'lucide-react';

export function Login(){
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e){
    e.preventDefault()
    setError('');

    try {
      setCargando(true);
      const usuario = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          correo: correo,       
          contrasena: password  
        })
      });

      setToken(usuario.token);
      navigate('/dashboard')

    } catch (error) {
      setError(error.message || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200 p-12">
        <Link to={'/'} className="text-slate-400 hover:text-emerald-600 flex items-center space-x-1 text-xs font-bold mb-8 uppercase tracking-widest">
          <ChevronRight size={16} className="rotate-180" />
          <span>Volver al inicio</span>
        </Link>

        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-lg bg-emerald-600 shadow-emerald-100">
            <Store size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Ingreso de Negocio
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Gestiona tu tienda ahora
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Email del Dueño
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
              type="email"
              placeholder="ejemplo@bodega.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              onChange={(e)=> setCorreo(e.target.value)}
              required
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              onChange={(e)=>{setPassword(e.target.value)}}
              required
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold border border-rose-100">
              {error}
            </div>
          )}

          <button type="submit" disabled={cargando} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] mt-4 disabled:opacity-50">
            {cargando ? 'Ingresando...' : 'Entrar a mi Panel'}
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          ¿No tienes cuenta? <Link to="/register" className="text-emerald-600 font-bold">Regístrate aquí</Link>
        </p>
      </div>
    </div>    
  )
}
