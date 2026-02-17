import { Navbar } from '../components/Nav.jsx'
import { Link } from 'react-router-dom'
import { 
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export function Home(){
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
        <Navbar />
        <section className="px-8 pt-16 pb-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold mb-6">
                <CheckCircle2 size={14} />
                <span>Diseñado para Bodegas del Perú</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Controla tu bodega <br />
                <span className="text-emerald-600">fácil y rápido.</span>
            </h1>
            <p className="text-slate-500 text-lg mb-10 max-w-lg leading-relaxed">
                Olvídate del cuaderno. Gestiona tus ventas, compras a proveedores y stock de productos en una sola aplicación pensada para tu día a día.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-200 hover:bg-emerald-700 flex items-center justify-center space-x-2 group transition-all">
                <span>Empezar Gratis</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center space-x-3 px-4">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>)}
                </div>
                <span className="text-xs font-bold text-slate-500">+500 bodegas registradas</span>
                </div>
            </div>
            </div>
            <div className="relative">
            <div className="bg-emerald-900/5 rounded-[40px] p-8 relative z-10 border border-emerald-100">
                <div className="bg-white rounded-3xl shadow-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                    <span className="font-bold">Nueva Venta</span>
                    <span className="text-emerald-600 font-bold">Total: S/ 45.50</span>
                    </div>
                    <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Leche Gloria 400g</span> <span>S/ 4.20</span></div>
                    <div className="flex justify-between text-sm"><span>Arroz Costeño 1kg</span> <span>S/ 3.80</span></div>
                    <div className="flex justify-between text-sm"><span>Aceite Primor 1L</span> <span>S/ 11.50</span></div>
                    </div>
                    <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Cobrar</button>
                </div>
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-200/30 blur-[100px] rounded-full -z-10"></div>
            </div>
        </div>
        </section>
    </div>
  )
}