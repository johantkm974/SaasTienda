import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Store,
  Save,
  Upload,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch, getRolFromToken } from '../api';

export function Ajustes(){
  const { empresa, setEmpresa } = useOutletContext()

  const esVendedor = getRolFromToken() === 'VENDEDOR';

  const [formData, setFormData] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [subiendoBanner, setSubiendoBanner] = useState(false)

  if (esVendedor) return <Navigate to="/dashboard" replace />;

  const subirImagen = async (e, tipo) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const setSubiendo = tipo === 'logo' ? setSubiendoLogo : setSubiendoBanner;
    setSubiendo(true);
    try {
      const lector = new FileReader();
      lector.onload = async () => {
        const res = await apiFetch('/api/empresas/imagen', {
          method: 'POST',
          body: JSON.stringify({ imagenBase64: lector.result }),
        });
        setFormData((f) => ({ ...f, [tipo === 'logo' ? 'logoUrl' : 'bannerUrl']: res.imagenUrl }));
      };
      lector.readAsDataURL(archivo);
    } catch (error) {
      alert('Error al subir la imagen: ' + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const actualizada = await apiFetch('/api/empresas/actualizar', {
        method: 'PUT',
        body: JSON.stringify({
          nombreComercial: formData.nombreComercial ?? empresa.nombreComercial,
          ruc: formData.ruc ?? empresa.ruc,
          telefono: formData.telefono ?? empresa.telefono,
          slogan: formData.slogan ?? empresa.slogan,
          colorPrimario: formData.colorPrimario ?? empresa.colorPrimario,
          logoUrl: formData.logoUrl ?? empresa.logoUrl,
          bannerUrl: formData.bannerUrl ?? empresa.bannerUrl,
          mostrarStock: formData.mostrarStock ?? empresa.mostrarStock,
          costoEnvio: formData.costoEnvio ?? empresa.costoEnvio ?? 0,
          envioGratisDesde: formData.envioGratisDesde ?? empresa.envioGratisDesde ?? null,
          contraEntrega: formData.contraEntrega ?? empresa.contraEntrega ?? false,
          contraEntregaMaximo: formData.contraEntregaMaximo ?? empresa.contraEntregaMaximo ?? null,
        })
      });
      setEmpresa(actualizada);
      alert('Datos actualizados correctamente');
    } catch (error) {
      alert('Error al actualizar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Tienda</h1>
        <p className="text-slate-500 text-sm">Actualiza los datos de tu negocio.</p>
      </div>

      <div className="mt-8 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
        {empresa ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-50">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <Store size={28} />
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">{empresa.nombreComercial}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{empresa.estado}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.nombreComercial ?? empresa.nombreComercial}
                onChange={(e) => setFormData({...formData, nombreComercial: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RUC</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.ruc ?? empresa.ruc}
                  onChange={(e) => setFormData({...formData, ruc: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.telefono ?? empresa.telefono ?? ''}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Eslogan (se muestra en tu tienda)</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.slogan ?? empresa.slogan ?? ''}
                onChange={(e) => setFormData({...formData, slogan: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color principal de la tienda</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    className="w-14 h-12 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer"
                    value={formData.colorPrimario ?? empresa.colorPrimario ?? '#10b981'}
                    onChange={(e) => setFormData({...formData, colorPrimario: e.target.value})}
                  />
                  <span className="text-xs font-bold text-slate-400">{formData.colorPrimario ?? empresa.colorPrimario ?? '#10b981'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mostrar stock en la tienda</label>
                <label className="flex items-center space-x-2 mt-3 text-sm font-bold text-slate-600">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-emerald-600"
                    checked={formData.mostrarStock ?? empresa.mostrarStock ?? true}
                    onChange={(e) => setFormData({...formData, mostrarStock: e.target.checked})}
                  />
                  <span>Los clientes ven la cantidad disponible</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo de la tienda</label>
                <div className="flex items-center space-x-3">
                  {(formData.logoUrl ?? empresa.logoUrl) && (
                    <img src={formData.logoUrl ?? empresa.logoUrl} alt="Logo" className="w-12 h-12 object-cover rounded-xl" />
                  )}
                  <label className="cursor-pointer flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600">
                    <Upload size={15} />
                    <span>{subiendoLogo ? 'Subiendo...' : 'Subir logo'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => subirImagen(e, 'logo')} />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner principal de la tienda</label>
                <div className="flex items-center space-x-3">
                  {(formData.bannerUrl ?? empresa.bannerUrl) && (
                    <img src={formData.bannerUrl ?? empresa.bannerUrl} alt="Banner" className="w-16 h-10 object-cover rounded-xl" />
                  )}
                  <label className="cursor-pointer flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600">
                    <Upload size={15} />
                    <span>{subiendoBanner ? 'Subiendo...' : 'Subir banner'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => subirImagen(e, 'banner')} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Costo de Envío (S/)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.costoEnvio ?? empresa.costoEnvio ?? 0}
                  onChange={(e) => setFormData({...formData, costoEnvio: e.target.value === '' ? 0 : Number(e.target.value)})}
                />
                <p className="text-[10px] font-bold text-slate-400 ml-1">Se cobra al cliente en la tienda (0 = gratis).</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Envío gratis desde (S/)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.envioGratisDesde ?? empresa.envioGratisDesde ?? ''}
                  onChange={(e) => setFormData({...formData, envioGratisDesde: e.target.value === '' ? null : Number(e.target.value)})}
                  placeholder="Sin envío gratis"
                />
                <p className="text-[10px] font-bold text-slate-400 ml-1">Si el subtotal supera este monto, el envío es gratis.</p>
              </div>
            </div>

            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3">Pago contra entrega</p>
              <label className="flex items-center justify-between cursor-pointer py-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">Aceptar pago contra entrega</p>
                  <p className="text-xs text-slate-400">El cliente paga cuando recibe el pedido (puede implicar riesgo de pedidos no cobrados)</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                  checked={formData.contraEntrega ?? empresa.contraEntrega ?? false}
                  onChange={(e) => setFormData({...formData, contraEntrega: e.target.checked})}
                />
              </label>
              <label className="block mt-3 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto máximo (S/) — vacío = sin límite</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  disabled={!(formData.contraEntrega ?? empresa.contraEntrega ?? false)}
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                  value={formData.contraEntregaMaximo ?? empresa.contraEntregaMaximo ?? ''}
                  onChange={(e) => setFormData({...formData, contraEntregaMaximo: e.target.value === '' ? null : Number(e.target.value)})}
                  placeholder="Ej: 200"
                />
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={guardando}
                className="cursor-pointer bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Save size={18} />
                <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-400 font-medium">Cargando datos de la empresa...</p>
        )}
      </div>
    </div>
  )
}
