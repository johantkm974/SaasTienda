import { Store } from 'lucide-react';
import {Link} from "react-router-dom"

export function Navbar({ onLoginClick }){
  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100">
        <Store size={22} />
        </div>
        <span className="text-xl font-bold tracking-tight text-emerald-900">BodegaControl</span>
      </div>
      <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-600">
        <Link to="/" className="hover:text-emerald-600">Inicio</Link>
        <Link to="/" className="hover:text-emerald-600">nosotros</Link>
        {/* <Link to="/venta" className="hover:text-emerald-600">Ventas</Link>
        <Link to="/inventario" className="hover:text-emerald-600">Inventario</Link> */}
        <Link to="/dashboard" className="hover:text-emerald-600">Precios</Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/login" onClick={onLoginClick} className="text-sm font-bold text-slate-700 hover:text-emerald-600 px-4 py-2">
        Entrar
        </Link>
        <Link to="/register"className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
        Registrar mi Negocio
        </Link>
      </div>
    </nav>
  )
}