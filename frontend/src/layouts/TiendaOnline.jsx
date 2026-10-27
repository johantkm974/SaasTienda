import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Image as ImageIcon, FileText, KeyRound, Save, Trash2, Plus, X, Upload, Globe } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch, getRolFromToken } from '../api';

const TABS = [
  { id: 'banners', label: 'Banners', icon: ImageIcon },
  { id: 'textos', label: 'Textos de la página', icon: FileText },
  { id: 'credenciales', label: 'Credenciales de pago', icon: KeyRound },
];

const PROVEEDORES = [
  {
    id: 'MERCADO_PAGO',
    nombre: 'Mercado Pago',
    descripcion: 'Token de prueba/producción de la tienda (developer.mercadopago.com)',
    campos: [
      ['mp_access_token', 'Access Token'],
      ['mp_public_key', 'Public Key'],
    ],
  },
  {
    id: 'PAYPAL',
    nombre: 'PayPal (sandbox)',
    descripcion: 'Credenciales de la app sandbox (developer.paypal.com/dashboard)',
    campos: [
      ['paypal_client_id', 'Client ID'],
      ['paypal_client_secret', 'Client Secret'],
      ['paypal_mode', 'Modo (sandbox o live)'],
    ],
  },
  {
    id: 'CLOUDINARY',
    nombre: 'Cloudinary',
    descripcion: 'Subida de imágenes de la tienda (cloudinary.com/console)',
    campos: [
      ['cloud_name', 'Cloud Name'],
      ['api_key', 'API Key'],
      ['api_secret', 'API Secret'],
      ['upload_preset', 'Upload Preset (opcional)'],
    ],
  },
  {
    id: 'EMAIL',
    nombre: 'Email (Brevo)',
    descripcion: 'Envío de recibos de venta por correo (app.brevo.com)',
    campos: [
      ['brevo_api_key', 'API Key Brevo'],
      ['correo_from', 'Correo remitente'],
      ['nombre_from', 'Nombre remitente'],
    ],
  },
];

const VISTAS = ['home', 'tienda', 'productos', 'nosotros', 'contactanos', 'footer'];

function inputClase() {
  return 'w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none';
}

function BotonGuardar({ guardando }) {
  return (
    <button
      type="submit"
      disabled={guardando}
      className="cursor-pointer bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center space-x-2 disabled:opacity-50"
    >
      <Save size={16} />
      <span>{guardando ? 'Guardando...' : 'Guardar'}</span>
    </button>
  );
}

export function TiendaOnline() {
  const { empresa } = useOutletContext();
  const esVendedor = getRolFromToken() === 'VENDEDOR';
  const [tab, setTab] = useState('banners');

  if (esVendedor) return <Navigate to="/dashboard" replace />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <Globe size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tienda Online</h1>
          <p className="text-slate-500 text-sm">
            Personaliza tu página pública {empresa ? `(${empresa.nombreComercial})` : ''}: banners, textos y pagos.
          </p>
        </div>
      </div>

      <div className="mt-6 flex space-x-2 bg-white border border-slate-100 rounded-2xl p-1.5 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`cursor-pointer flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
        {tab === 'banners' && <BannersTab />}
        {tab === 'textos' && <TextosTab />}
        {tab === 'credenciales' && <CredencialesTab />}
      </div>
    </div>
  );
}

/* ============================ BANNERS ============================ */

function BannersTab() {
  const [banners, setBanners] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: '', subtitulo: '', descripcion: '', enlace: '', pagina: 'tienda', orden: 0, activo: true, imagenUrl: '' });
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      setBanners(await apiFetch('/api/banners'));
    } catch {
      setBanners([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const iniciarNuevo = () => {
    setEditing(null);
    setForm({ titulo: '', subtitulo: '', descripcion: '', enlace: '', pagina: 'tienda', orden: 0, activo: true, imagenUrl: '' });
  };

  const iniciarEdicion = (b) => {
    setEditing(b);
    setForm({ ...b });
  };

  const subirImagen = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    try {
      const lector = new FileReader();
      lector.onload = async () => {
        const res = await apiFetch('/api/banners/imagen', {
          method: 'POST',
          body: JSON.stringify({ imagenBase64: lector.result }),
        });
        setForm((f) => ({ ...f, imagenUrl: res.imagenUrl }));
      };
      lector.readAsDataURL(archivo);
    } finally {
      setSubiendo(false);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editing) {
        await apiFetch(`/api/banners/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/banners', { method: 'POST', body: JSON.stringify(form) });
      }
      iniciarNuevo();
      await cargar();
    } catch (err) {
      alert('Error al guardar el banner: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (b) => {
    if (!window.confirm(`¿Eliminar el banner "${b.titulo || 'sin título'}"?`)) return;
    try {
      await apiFetch(`/api/banners/${b.id}`, { method: 'DELETE' });
      await cargar();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Banners de la tienda</h2>
          <p className="text-xs text-slate-400 font-medium">Imágenes destacadas que se muestran en tu página.</p>
        </div>
        <button type="button" onClick={iniciarNuevo} className="cursor-pointer flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl font-bold text-sm hover:bg-emerald-700">
          <Plus size={16} />
          <span>Nuevo banner</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {cargando && <p className="text-sm text-slate-400">Cargando banners...</p>}
        {!cargando && banners.length === 0 && (
          <p className="text-sm text-slate-400 col-span-2">Aún no tienes banners. Crea uno con la imagen y textos de tu tienda.</p>
        )}
        {banners.map((b) => (
          <div key={b.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            {b.imagenUrl ? (
              <img src={b.imagenUrl} alt={b.titulo} className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-300"><ImageIcon size={28} /></div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 text-sm">{b.titulo || 'Sin título'}</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${b.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {b.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                  <button type="button" onClick={() => eliminar(b)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg" title="Eliminar">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">{b.subtitulo || b.descripcion || '—'}</p>
              <button type="button" onClick={() => iniciarEdicion(b)} className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <h3 className="font-black text-slate-900">{editing ? 'Editar banner' : 'Nuevo banner'}</h3>
        <form className="mt-4 space-y-4" onSubmit={guardar}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título</label>
              <input className={inputClase()} value={form.titulo || ''} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo</label>
              <input className={inputClase()} value={form.subtitulo || ''} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
            <textarea className={inputClase()} rows={2} value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enlace (opcional)</label>
              <input className={inputClase()} placeholder="https://..." value={form.enlace || ''} onChange={(e) => setForm({ ...form, enlace: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Página</label>
              <select className={inputClase()} value={form.pagina || 'tienda'} onChange={(e) => setForm({ ...form, pagina: e.target.value })}>
                {['tienda', 'home', 'productos', 'nosotros', 'contactanos'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Orden</label>
              <input type="number" className={inputClase()} value={form.orden ?? 0} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagen</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600">
                <Upload size={15} />
                <span>{subiendo ? 'Subiendo...' : 'Subir imagen'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={subirImagen} />
              </label>
              {form.imagenUrl && <img src={form.imagenUrl} alt="" className="w-16 h-10 object-cover rounded-lg" />}
              {form.imagenUrl && (
                <button type="button" onClick={() => setForm({ ...form, imagenUrl: '' })} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg" title="Quitar imagen">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 text-sm font-bold text-slate-600">
              <input type="checkbox" checked={form.activo !== false} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="w-4 h-4 accent-emerald-600" />
              <span>Visible en la tienda</span>
            </label>
            <BotonGuardar guardando={guardando} />
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================ TEXTOS ============================ */

function TextosTab() {
  const [textos, setTextos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroVista, setFiltroVista] = useState('home');
  const [guardandoId, setGuardandoId] = useState(null);
  const [nuevo, setNuevo] = useState({ clave: '', valorTexto: '' });

  const cargar = async () => {
    try {
      setTextos(await apiFetch('/api/contenido'));
    } catch {
      setTextos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (t) => {
    setGuardandoId(t.id);
    try {
      await apiFetch(`/api/contenido/${t.id}`, {
        method: 'PUT',
        body: JSON.stringify({ vista: t.vista, clave: t.clave, valorTexto: t.valorTexto, activo: t.activo !== false }),
      });
      await cargar();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setGuardandoId(null);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    if (!nuevo.clave.trim() || !nuevo.valorTexto.trim()) return;
    try {
      await apiFetch('/api/contenido', {
        method: 'POST',
        body: JSON.stringify({ vista: filtroVista, clave: nuevo.clave.trim(), valorTexto: nuevo.valorTexto }),
      });
      setNuevo({ clave: '', valorTexto: '' });
      await cargar();
    } catch (err) {
      alert('Error al crear el texto: ' + err.message);
    }
  };

  const eliminar = async (t) => {
    if (!window.confirm(`¿Eliminar el texto "${t.clave}"?`)) return;
    try {
      await apiFetch(`/api/contenido/${t.id}`, { method: 'DELETE' });
      await cargar();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editables = textos.filter((t) => t.vista === filtroVista);

  return (
    <div>
      <div>
        <h2 className="text-lg font-black text-slate-900">Textos de tu página</h2>
        <p className="text-xs text-slate-400 font-medium">Cambia títulos, subtítulos y frases que ven tus clientes.</p>
      </div>

      <div className="mt-4 flex space-x-2 flex-wrap gap-y-2">
        {VISTAS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFiltroVista(v)}
            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
              filtroVista === v ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {cargando && <p className="text-sm text-slate-400">Cargando textos...</p>}
        {!cargando && editables.length === 0 && (
          <p className="text-sm text-slate-400">No hay textos para esta vista.</p>
        )}
        {editables.map((t) => (
          <div key={t.id} className="border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <code className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase">{t.clave}</code>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-500">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-emerald-600"
                    checked={t.activo !== false}
                    onChange={async (e) => {
                      await apiFetch(`/api/contenido/${t.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ vista: t.vista, clave: t.clave, valorTexto: t.valorTexto, activo: e.target.checked }),
                      });
                      await cargar();
                    }}
                  />
                  Visible
                </label>
                <button type="button" onClick={() => eliminar(t)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              className={`${inputClase()} mt-3`}
              value={t.valorTexto || ''}
              onChange={(e) => {
                const copia = [...textos];
                const idx = copia.findIndex((x) => x.id === t.id);
                copia[idx] = { ...copia[idx], valorTexto: e.target.value };
                setTextos(copia);
              }}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => guardar(t)}
                disabled={guardandoId === t.id}
                className="cursor-pointer flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save size={13} />
                <span>{guardandoId === t.id ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <h3 className="font-black text-slate-900">Añadir texto a "{filtroVista}"</h3>
        <form className="mt-4 flex items-end space-x-3" onSubmit={crear}>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clave (identificador)</label>
            <input className={inputClase()} placeholder="ej: titulo_bienvenida" value={nuevo.clave} onChange={(e) => setNuevo({ ...nuevo, clave: e.target.value })} />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texto</label>
            <input className={inputClase()} value={nuevo.valorTexto} onChange={(e) => setNuevo({ ...nuevo, valorTexto: e.target.value })} />
          </div>
          <button type="submit" className="cursor-pointer flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800">
            <Plus size={15} />
            <span>Agregar</span>
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================ CREDENCIALES ============================ */

function CredencialesTab() {
  const [resumen, setResumen] = useState(null);
  const [valores, setValores] = useState({});
  const [guardandoProveedor, setGuardandoProveedor] = useState(null);

  const cargar = async () => {
    try {
      const data = await apiFetch('/api/empresas/mi-empresa/credenciales');
      setResumen(data);
    } catch {
      setResumen({});
    }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (proveedor) => {
    setGuardandoProveedor(proveedor);
    try {
      const cuerpo = {};
      (valores[proveedor] || {}).paraEnviar.forEach(([clave, valor]) => {
        if (valor && valor.trim()) cuerpo[clave] = valor.trim();
      });
      if (Object.keys(cuerpo).length === 0) {
        alert('Escribe al menos un valor nuevo');
        return;
      }
      const resultado = await apiFetch(`/api/empresas/mi-empresa/credenciales/${proveedor}`, {
        method: 'PUT',
        body: JSON.stringify(cuerpo),
      });
      setResumen((prev) => ({ ...prev, [proveedor]: resultado }));
      setValores((prev) => ({ ...prev, [proveedor]: { paraEnviar: [], } }));
    } catch (err) {
      alert('Error al guardar credenciales: ' + err.message);
    } finally {
      setGuardandoProveedor(null);
    }
  };

  const valorDe = (proveedor, clave) => {
    const dato = resumen?.[proveedor]?.[clave];
    return dato?.presente ? dato.valor : '';
  };

  const registrarValor = (proveedor, clave, valor) => {
    setValores((prev) => {
      const actual = prev[proveedor]?.paraEnviar || [];
      const otros = actual.filter(([c]) => c !== clave);
      return { ...prev, [proveedor]: { paraEnviar: [...otros, [clave, valor]] } };
    });
  };

  return (
    <div>
      <div>
        <h2 className="text-lg font-black text-slate-900">Credenciales de tu tienda</h2>
        <p className="text-xs text-slate-400 font-medium">
          Se guardan cifradas. Los campos que dejes vacíos conservan el valor actual.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {PROVEEDORES.map((p) => (
          <div key={p.id} className="border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900">{p.nombre}</h3>
                <p className="text-xs text-slate-400">{p.descripcion}</p>
              </div>
              {!resumen && <p className="text-xs text-slate-400">Cargando...</p>}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {p.campos.map(([clave, etiqueta]) => (
                <div key={clave} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{etiqueta}</label>
                  <input
                    type="password"
                    className={inputClase()}
                    placeholder={valorDe(p.id, clave) || 'No configurado'}
                    value={((valores[p.id] || {}).paraEnviar || []).find(([c]) => c === clave)?.[1] || ''}
                    onChange={(e) => registrarValor(p.id, clave, e.target.value)}
                  />
                  {valorDe(p.id, clave) && (
                    <p className="text-[10px] font-bold text-emerald-600 ml-1">Configurado: {valorDe(p.id, clave)}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => guardar(p.id)}
                disabled={guardandoProveedor === p.id}
                className="cursor-pointer flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save size={15} />
                <span>{guardandoProveedor === p.id ? 'Guardando...' : 'Guardar credenciales'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
