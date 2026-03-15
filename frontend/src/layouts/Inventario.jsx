import { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  TrendingUp,
  AlertTriangle,
  Filter,
  Edit3,
  Trash2,
  ArrowUpCircle
} from 'lucide-react';

import { ModalProducto } from '../components/ModalProducto';
import { DeleteModalProducto } from '../components/DeleteModalProducto';

export function Inventario(){

  const {productos, setProductos, categorias, setCategorias} = useOutletContext()

  const [filter, setFilter] = useState('Todos');
  // const [productos, setProductos] = useState([])
  // const [categorias, setCategorias] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productoAELiminar, setProductoAELiminar] = useState(null);

  const minStock = 20

  // useEffect(()=>{
  //   const token = JSON.parse(localStorage.getItem('token-user'))

  //   if(token){
  //     fetch('http://localhost:8080/api/productos',{
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
        
  //     })
  //       .then(response=>response.json())
  //       .then(data=>{
  //         setProductos(data)
  //         console.log(data)
  //       })
  //   }
  //     if(token){
  //     fetch('http://localhost:8080/api/categorias',{
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
        
  //     })
  //       .then(response=>response.json())
  //       .then(data=>{
  //         setCategorias(data)
  //       })
  //   }
  // },[])

  const confirmarEliminacion = async () => {
    if (!productoAELiminar) return;

    const token = JSON.parse(localStorage.getItem('token-user'));
    
    try {
      const response = await fetch(`http://localhost:8080/api/productos/${productoAELiminar.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 1. Filtramos el estado local para quitar el producto borrado
        setProductos(productos.filter(p => p.id !== productoAELiminar.id));
        // 2. Cerramos el modal
        setProductoAELiminar(null);
        console.log("Producto eliminado con éxito");
      } else {
        const errorText = await response.text();
        console.error("Error al eliminar:", errorText);
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  const agregarProducto = async (datosDelFormulario) => {
    const token = JSON.parse(localStorage.getItem('token-user'))
    if(!token){
      console.error("No se encontró el token de autenticación.")
      return
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    try{
      const response = await fetch('http://localhost:8080/api/productos',{
        method: 'POST',
        headers: {
          'Authorization' : `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresa: { id: payload.empresaId },
          nombre: datosDelFormulario.name,
          categoria: { id: parseInt(datosDelFormulario.category) },
          descripcion: datosDelFormulario.description,
          precioVenta: parseFloat(datosDelFormulario.price),
          stockActual: parseInt(datosDelFormulario.stock),
          imagenUrl: datosDelFormulario.imgUrl,
        //   minStock: parseInt(datosDelFormulario.minStock),
        //   cost: parseFloat(formData.cost)
        })
      });
      if (response.ok) {
      const productoCreado = await response.json();
      setProductos([...productos, productoCreado]);
      setIsModalOpen(false);
      } else {
        const errorData = await response.text();
        console.error(`Error ${response.status}: ${errorData}`);
      }
    }
    catch(error){
      console.error("Error al guardar el producto:", error);
    }
  }
  
  const productosCriticos = useMemo(()=>{
    if(productos.length === 0) return
    return productos.reduce((acc,producto)=>{return producto.stockActual < 2 ? acc + 1 : acc},0)
  },[productos])

  const valorTotalInventario = useMemo(()=>{
    if(productos.length === 0) return
    return productos.reduce((acc,producto)=>{
      const total = producto.precioVenta *producto.stockActual
      return acc + total
    },0)
  },[productos])

  return (
  <>
    <ModalProducto 
      isOpen={isModalOpen}
      onClose={()=>setIsModalOpen(false)}
      opcionesCategorias={categorias}
      onSave={agregarProducto}
    />
    <DeleteModalProducto
      isOpen={!!productoAELiminar}
      onClose={() => setProductoAELiminar(null)}
      onConfirm={confirmarEliminacion}
      p={productoAELiminar}
    />
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Gestión de Inventario
        </h1>
        <p className="text-slate-500 text-sm">
          Administra tus productos y precios.
        </p>
      </div>
      <div className="flex space-x-3">
        <button 
          onClick={()=>setIsModalOpen(true)}
          className="cursor-pointer bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg shadow-slate-200">
          <Plus size={18} />
          Añadir Productoz
        </button>
        {/* {activeTab === 'dashboard' && (
          <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 flex items-center space-x-2">
            <Truck size={18} />
            <span>Pedido</span>
          </button>
        )} */}
      </div>
    </div>
  
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Mini Stats de Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Package size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Productos </p>
            <p className="text-xl font-bold text-slate-800">{productos.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Por Agotarse</p>
            <p className="text-xl font-bold text-slate-800">{productosCriticos} </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Inventario</p>
            <p className="text-xl font-bold text-slate-800">
              {/* {valorTotalInventario.toLocaleString('es-PE', {
                style: 'currency',
                currency: 'PEN',
                minimumFractionDigits: 2
              })} */}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categorias.map((cat) => (
            <button 
              key={`cat-${cat.id}`}
              onClick={() => setFilter(cat.nombre)}
              className={`cursor-pointerpx-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === cat.nombre ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Filtrar por nombre o código..." className="bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-64" />
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">Producto</th>
                <th className="py-4 px-4">Categoría</th>
                <th className="py-4 px-4 text-center">Stock</th>
                <th className="py-4 px-4 text-right">Costo unit.</th>
                <th className="py-4 px-4 text-right">Precio Venta</th>
                <th className="py-4 px-4">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productos.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{p.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Cod: #B00{p.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500 font-medium"> {p.categoria.nombre}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-bold ${p.stockActual <= minStock ? 'text-rose-500' : 'text-slate-700'}`}>
                      {p.stockActual}
                    </span>
                    <span className="text-slate-300 text-[10px] ml-1">/ {minStock} min</span>
                  </td>
                  <td className="py-4 px-4 text-right text-xs text-slate-400 italic">                    
                    {p.precioVenta.toLocaleString('es-PE', {
                      style: 'currency',
                      currency: 'PEN',
                      minimumFractionDigits: 2
                    })}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-700 text-sm">
                    {p.precioVenta.toLocaleString('es-PE', {
                      style: 'currency',
                      currency: 'PEN',
                      minimumFractionDigits: 2
                    })}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                      p.stockActual === 0 ? 'bg-rose-50 text-rose-600' : 
                      p.stockActual <= minStock ? 'bg-amber-50 text-amber-600' : 
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {p.stockActual === 0 ? 'Sin Stock' : p.stockActual <= minStock ? 'Por Agotarse' : 'En Stock'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* <button className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-lg transition-colors" title="Añadir Stock">
                        <ArrowUpCircle size={16} />
                      </button> */}
                      <button className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg transition-colors" title="Editar">
                        <Edit3 size={16} />
                      </button>
                      <button className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg transition-colors" title="Eliminar"
                        onClick={() => setProductoAELiminar(p)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>
  )
}