import { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  TrendingUp,
  AlertTriangle,
  Filter,
  Edit3,
  Trash2,
  Tags,
} from 'lucide-react';

import { ModalProducto } from '../components/ModalProducto';
import { DeleteModalProducto } from '../components/DeleteModalProducto';
import { CategoriaModal } from '../components/CategoriaModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Pagination } from '../components/Pagination';
import { apiFetch, getRolFromToken } from '../api';

const PAGE_SIZE = 10;

export function Inventario(){

  const {productos, setProductos, categorias, setCategorias} = useOutletContext()
  const [searchParams] = useSearchParams();

  const [filter, setFilter] = useState('Todos');
  const [busqueda, setBusqueda] = useState(searchParams.get('busqueda') || '');
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [productoAELiminar, setProductoAELiminar] = useState(null);
  const [guardando, setGuardando] = useState(false)

  const esVendedor = getRolFromToken() === 'VENDEDOR';

  // --- Categorías ---
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);

  const guardarCategoria = async (datos) => {
    setGuardandoCategoria(true);
    try {
      if (categoriaAEditar) {
        const data = await apiFetch(`/api/categorias/${categoriaAEditar.id}`, {
          method: 'PUT',
          body: JSON.stringify(datos)
        });
        setCategorias(categorias.map((c) => (c.id === categoriaAEditar.id ? data : c)));
      } else {
        const data = await apiFetch('/api/categorias', {
          method: 'POST',
          body: JSON.stringify(datos)
        });
        setCategorias([...categorias, data]);
      }
      setCategoriaModalOpen(false);
      setCategoriaAEditar(null);
    } catch (error) {
      alert('Error al guardar categoría: ' + error.message);
    } finally {
      setGuardandoCategoria(false);
    }
  };

  const confirmarEliminacionCategoria = async () => {
    if (!categoriaAEliminar) return;
    try {
      await apiFetch(`/api/categorias/${categoriaAEliminar.id}`, { method: 'DELETE' });
      setCategorias(categorias.filter((c) => c.id !== categoriaAEliminar.id));
      if (filter === categoriaAEliminar.nombre) setFilter('Todos');
      setCategoriaAEliminar(null);
    } catch (error) {
      alert('Error al eliminar categoría: ' + error.message);
    }
  };

  const confirmarEliminacion = async () => {
    if (!productoAELiminar) return;

    try {
      await apiFetch(`/api/productos/${productoAELiminar.id}`, { method: 'DELETE' });
      setProductos(productos.filter(p => p.id !== productoAELiminar.id));
      setProductoAELiminar(null);
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const guardarProducto = async (datosDelFormulario) => {
    const precio = parseFloat(datosDelFormulario.price);
    const stock = parseInt(datosDelFormulario.stock);
    const categoriaId = parseInt(datosDelFormulario.category);
    const minStock = parseInt(datosDelFormulario.minStock);

    if (!precio || precio <= 0) {
      alert('Ingresa un precio de venta válido');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      alert('Ingresa un stock válido');
      return;
    }
    if (!categoriaId) {
      alert('Selecciona una categoría');
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        nombre: datosDelFormulario.name,
        categoria: { id: categoriaId },
        descripcion: datosDelFormulario.description,
        precioVenta: precio,
        stockActual: stock,
        imagenUrl: datosDelFormulario.imgUrl,
        stockMinimo: minStock || 5,
        marca: datosDelFormulario.marca,
        codigoSku: datosDelFormulario.codigoSku,
        destacado: datosDelFormulario.destacado,
      };

      if (productoAEditar) {
        await apiFetch(`/api/productos/${productoAEditar.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setProductos(productos.map(p => p.id === productoAEditar.id ? { ...p, ...payload, categoria: p.categoria } : p));
      } else {
        const productoCreado = await apiFetch('/api/productos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setProductos([...productos, productoCreado]);
      }

      setIsModalOpen(false);
      setProductoAEditar(null);
    } catch (error) {
      alert('Error al guardar producto: ' + error.message);
    } finally {
      setGuardando(false);
    }
  }

  const productosCriticos = useMemo(()=>{
    return productos.reduce((acc,producto)=>{
      return producto.stockActual <= (producto.stockMinimo || 5) ? acc + 1 : acc
    },0)
  },[productos])

  const valorTotalInventario = useMemo(()=>{
    return productos.reduce((acc,producto)=>{
      return acc + (Number(producto.precioVenta) || 0) * (producto.stockActual || 0)
    },0)
  },[productos])

  const productosFiltrados = useMemo(() => {
    const filtrados = productos.filter((p) => {
      const coincideCategoria = filter === 'Todos' || (p.categoria?.nombre === filter);
      const coincideBusqueda = !busqueda || (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
    return filtrados;
  }, [productos, filter, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(page, totalPaginas - 1);
  const productosPagina = productosFiltrados.slice(paginaActual * PAGE_SIZE, paginaActual * PAGE_SIZE + PAGE_SIZE);

  const cambiarPagina = (nueva) => {
    setPage(nueva);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
  <>
    <ModalProducto 
      key={productoAEditar?.id ?? 'nuevo'}
      isOpen={isModalOpen}
      onClose={() => { setIsModalOpen(false); setProductoAEditar(null); }}
      opcionesCategorias={categorias}
      onSave={guardarProducto}
      producto={productoAEditar}
      guardando={guardando}
    />
    <DeleteModalProducto
      isOpen={!!productoAELiminar}
      onClose={() => setProductoAELiminar(null)}
      onConfirm={confirmarEliminacion}
      p={productoAELiminar}
    />
    <CategoriaModal
      key={categoriaAEditar?.id ?? 'nueva'}
      isOpen={categoriaModalOpen}
      onClose={() => { setCategoriaModalOpen(false); setCategoriaAEditar(null); }}
      onSave={guardarCategoria}
      categoria={categoriaAEditar}
      guardando={guardandoCategoria}
    />
    <ConfirmModal
      isOpen={!!categoriaAEliminar}
      titulo="Eliminar categoría"
      mensaje={`¿Seguro que deseas eliminar "${categoriaAEliminar?.nombre}"? Los productos quedarán sin categoría.`}
      onCancel={() => setCategoriaAEliminar(null)}
      onConfirm={confirmarEliminacionCategoria}
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
      {!esVendedor && (
        <div className="flex space-x-3">
          <button 
            onClick={() => { setCategoriaAEditar(null); setCategoriaModalOpen(true); }}
            className="cursor-pointer bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-sm hover:bg-slate-50">
            <Tags size={18} />
            Nueva Categoría
          </button>
          <button 
            onClick={()=>setIsModalOpen(true)}
            className="cursor-pointer bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg shadow-slate-200">
            <Plus size={18} />
            Añadir Producto
          </button>
        </div>
      )}
    </div>
  
    <div className="space-y-6 animate-in fade-in duration-500">
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
            <p className="text-xl font-bold text-slate-800">{productosCriticos}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Inventario</p>
            <p className="text-xl font-bold text-slate-800">
              {valorTotalInventario.toLocaleString('es-PE', {
                style: 'currency',
                currency: 'PEN',
                minimumFractionDigits: 2
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            onClick={() => { setFilter('Todos'); setPage(0); }}
            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'Todos' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button 
              key={`cat-${cat.id}`}
              onClick={() => { setFilter(cat.nombre); setPage(0); }}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === cat.nombre ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filtrar por nombre o código..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPage(0); }}
            className="bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">Producto</th>
                <th className="py-4 px-4">Categoría</th>
                <th className="py-4 px-4 text-center">Stock</th>
                <th className="py-4 px-4 text-right">Precio Venta</th>
                <th className="py-4 px-4">Estado</th>
                {!esVendedor && <th className="py-4 px-6 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productosPagina.length === 0 ? (
                <tr><td colSpan={esVendedor ? 5 : 6} className="py-8 text-center text-sm text-slate-400 font-medium">No hay productos</td></tr>
              ) : (
                productosPagina.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{p.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Cod: #B00{p.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 font-medium"> {p.categoria?.nombre || '—'}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${p.stockActual <= (p.stockMinimo || 5) ? 'text-rose-500' : 'text-slate-700'}`}>
                        {p.stockActual}
                      </span>
                      <span className="text-slate-300 text-[10px] ml-1">/ {p.stockMinimo || 5} min</span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-700 text-sm">
                      {Number(p.precioVenta || 0).toLocaleString('es-PE', {
                        style: 'currency',
                        currency: 'PEN',
                        minimumFractionDigits: 2
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                        p.stockActual === 0 ? 'bg-rose-50 text-rose-600' : 
                        p.stockActual <= (p.stockMinimo || 5) ? 'bg-amber-50 text-amber-600' : 
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {p.stockActual === 0 ? 'Sin Stock' : p.stockActual <= (p.stockMinimo || 5) ? 'Por Agotarse' : 'En Stock'}
                      </span>
                    </td>
                    {!esVendedor && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg transition-colors" title="Editar"
                            onClick={() => { setProductoAEditar(p); setIsModalOpen(true); }}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg transition-colors" title="Eliminar"
                            onClick={() => setProductoAELiminar(p)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={paginaActual}
          totalPages={totalPaginas}
          onPageChange={cambiarPagina}
          registros={productosPagina.length}
          total={productosFiltrados.length}
        />
      </div>
    </div>
  </>
  )
}
