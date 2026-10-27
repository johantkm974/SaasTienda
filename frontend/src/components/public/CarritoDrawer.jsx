import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingCart, CheckCircle, Clock, AlertCircle, Download, User } from 'lucide-react';
import { useCarrito } from '../../context/CarritoContext';
import { apiFetch, API_URL } from '../../api';
import { formatearPrecio, IMAGEN_PLACEHOLDER } from '../../utils/formato';

const CLASES = {
  sobre: 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm',
  panel: 'fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col',
  head: 'flex items-center justify-between p-5 border-b border-slate-100',
  titulo: 'text-lg font-black text-slate-900 flex items-center gap-2',
  x: 'cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors',
  item: 'flex gap-3 p-4 border-b border-slate-50',
  img: 'w-16 h-16 object-cover rounded-xl bg-slate-100 shrink-0',
  nombre: 'text-sm font-bold text-slate-800 leading-tight',
  precio: 'text-sm font-black text-emerald-600',
  qty: 'flex items-center gap-2 border border-slate-100 rounded-lg px-2 py-1',
  qtyBtn: 'cursor-pointer w-6 h-6 flex items-center justify-center rounded bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold',
  qtyTxt: 'text-sm font-bold text-slate-800 min-w-4 text-center',
  total: 'flex items-center justify-between p-5 border-t border-slate-100',
  totalTxt: 'font-black text-slate-900 text-lg',
  boton: 'cursor-pointer bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 transition-all',
  botonSec: 'cursor-pointer bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all',
  input: 'w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none',
  label: 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
  oculto: 'max-h-0 opacity-0 overflow-hidden transition-all duration-300',
  visible: 'max-h-[500px] opacity-100 overflow-visible transition-all duration-300',
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase',
  success: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  error: 'bg-rose-100 text-rose-700',
};

export function CarritoDrawer() {
  const ctx = useCarrito();
  if (!ctx) return null;

  const { drawerAbierto, setDrawerAbierto, vistaInicial } = ctx;
  const [vistaLocal, setVistaLocal] = useState(vistaInicial);

  if (drawerAbierto && vistaInicial !== vistaLocal) {
    setVistaLocal(vistaInicial);
  }

  if (!drawerAbierto) return null;

  return (
    <div className={CLASES.sobre} onClick={(e) => { if (e.target === e.currentTarget) setDrawerAbierto(false); }}>
      <div className={CLASES.panel}>
        <div className={CLASES.head}>
          <h2 className={CLASES.titulo}><ShoppingCart size={18} /> Carrito</h2>
          <button className={CLASES.x} onClick={() => setDrawerAbierto(false)}><X size={20} /></button>
        </div>
        <DrawerContenido key={vistaLocal} vistaInicial={vistaLocal} />
      </div>
    </div>
  );
}

function DrawerContenido({ vistaInicial }) {
  const ctx = useCarrito();
  const {
    empresaId, carrito, cantidadTotal, subtotal, costoEnvio, envioGratis, totalPedido,
    cliente, clienteToken,
    contraEntregaHabilitado, contraEntregaMaximo,
    cambiarCantidad, quitarDelCarrito, vaciarCarrito, setDrawerAbierto,
    setVistaInicial, mostrarToast, guardarSesion, cerrarSesion,
  } = ctx;

  const [vista, setVista] = useState(vistaInicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombres: cliente?.nombres || '',
    apellidos: cliente?.apellidos || '',
    correo: cliente?.correo || '',
    telefono: cliente?.telefono || '',
    direccion: cliente?.direccion || '',
    distrito: 'Lima',
    metodoPago: 'MERCADO_PAGO',
  });
  const [resultado, setResultado] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [misCompras, setMisCompras] = useState(null);
  const [cargandoCompras, setCargandoCompras] = useState(false);

  async function procesarCheckout(e) {
    e.preventDefault();
    if (carrito.length === 0) return;
    setEnviando(true);
    setError('');
    try {
      const conPago = form.metodoPago !== 'CONTADO';
      const res = await apiFetch(`/api/tienda/${empresaId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({
          ...(cliente ? { clienteId: cliente.id } : {
            nombres: form.nombres,
            apellidos: form.apellidos,
            correo: form.correo,
            telefono: form.telefono,
          }),
          direccion: form.direccion,
          distrito: form.distrito,
          conPago,
          metodoPago: form.metodoPago,
          items: carrito.map((i) => ({ productoId: i.id, cantidad: i.cantidad })),
        }),
      });
      vaciarCarrito();
      setResultado({
        ventaId: res.ventaId,
        total: res.total,
        estado: res.estadoVenta || res.estadoPago,
        conPago,
        metodoPago: res.metodoPago || form.metodoPago,
        correo: form.correo || (cliente && cliente.correo) || '',
      });
      if (res.paypalUrl) {
        setVista('resultado');
        window.open(res.paypalUrl, '_blank');
      } else if (res.initPoint) {
        setVista('resultado');
        window.open(res.initPoint, '_blank');
      } else {
        setVista('resultado');
      }
    } catch (err) {
      setError(err.message || 'No se pudo completar la compra');
    } finally {
      setEnviando(false);
    }
  }

  async function enviarAuth(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const correo = fd.get('correo');
    const contrasena = fd.get('contrasena');
    try {
      let data;
      if (authMode === 'registro') {
        data = await apiFetch(`/api/tienda/${empresaId}/registro`, {
          method: 'POST',
          body: JSON.stringify({
            nombres: fd.get('nombres'),
            apellidos: fd.get('apellidos'),
            correo,
            telefono: fd.get('telefono'),
            direccion: fd.get('direccion'),
            contrasena,
          }),
        });
      } else {
        data = await apiFetch(`/api/tienda/${empresaId}/login`, {
          method: 'POST',
          body: JSON.stringify({ correo, contrasena }),
        });
      }
      if (guardarSesion(data)) {
        mostrarToast(authMode === 'registro' ? 'Cuenta creada, sesión iniciada' : 'Sesión de cliente iniciada');
        setForm((f) => ({
          ...f,
          nombres: data.cliente?.nombres || f.nombres,
          apellidos: data.cliente?.apellidos || f.apellidos,
          correo: data.cliente?.correo || correo,
          telefono: data.cliente?.telefono || f.telefono,
          direccion: data.cliente?.direccion || f.direccion,
        }));
      } else {
        mostrarToast(authMode === 'registro' ? 'Cuenta de cliente creada' : 'Sesión de cliente iniciada');
      }
      setVista('carrito');
    } catch (err) {
      mostrarToast(err.message || 'No se pudo completar la operación');
    }
  }

  async function abrirMisCompras() {
    if (!clienteToken) {
      setAuthMode('login');
      setVista('login');
      return;
    }
    setVista('compras');
    setCargandoCompras(true);
    try {
      const compras = await apiFetch(`/api/tienda/${empresaId}/mis-compras`, {
        headers: { Authorization: `Bearer ${clienteToken}` },
      });
      setMisCompras(compras);
    } catch {
      setMisCompras([]);
      mostrarToast('No se pudieron cargar tus compras');
    } finally {
      setCargandoCompras(false);
    }
  }

  async function descargarRecibo(ventaId) {
    try {
      const response = await fetch(`${API_URL}/api/tienda/${empresaId}/compras/${ventaId}/recibo`, {
        headers: clienteToken ? { Authorization: `Bearer ${clienteToken}` } : {},
      });
      if (!response.ok) throw new Error('Error ' + response.status);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `recibo_venta_${ventaId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch {
      mostrarToast('No se pudo descargar el recibo');
    }
  }

  if (vista === 'carrito') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500">{cantidadTotal} producto(s) · {formatearPrecio(subtotal)}</span>
          {carrito.length > 0 && (
            <button className="text-xs font-bold text-rose-500 hover:underline" onClick={vaciarCarrito}>Vaciar carrito</button>
          )}
        </div>
        {carrito.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingCart className="mx-auto text-slate-200 mb-3" size={48} />
            <p className="font-bold text-slate-600">Tu carrito está vacío</p>
            <p className="text-sm text-slate-400 mt-1">Agrega productos del catálogo</p>
            <Link to={`/t/${empresaId}/productos`} onClick={() => setDrawerAbierto(false)} className={`${CLASES.boton} inline-flex items-center gap-2 mt-5 px-6`}>
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {carrito.map((i) => (
              <div key={i.id} className={CLASES.item}>
                <img className={CLASES.img} src={i.imagen || IMAGEN_PLACEHOLDER} alt={i.nombre} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={CLASES.nombre}>{i.nombre}</p>
                    <button className="text-rose-400 hover:text-rose-600" onClick={() => quitarDelCarrito(i.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className={CLASES.precio}>{formatearPrecio(i.precio)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className={CLASES.qty}>
                      <button className={CLASES.qtyBtn} onClick={() => cambiarCantidad(i.id, -1)}>-</button>
                      <span className={CLASES.qtyTxt}>{i.cantidad}</span>
                      <button
                        className={CLASES.qtyBtn}
                        onClick={() => cambiarCantidad(i.id, 1)}
                        disabled={i.cantidad >= i.stock}
                      >+</button>
                    </div>
                    <span className="text-sm font-black text-slate-900">{formatearPrecio(i.precio * i.cantidad)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-5 border-t border-slate-100 mt-auto">
              {error && <p className="text-xs font-bold text-rose-500 mb-3">{error}</p>}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatearPrecio(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Envío</span>
                  <span className={`font-bold ${envioGratis ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {envioGratis ? 'GRATIS' : costoEnvio > 0 ? formatearPrecio(costoEnvio) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-50">
                  <span className="font-black text-slate-900">Total</span>
                  <span className={CLASES.totalTxt}>{formatearPrecio(totalPedido)}</span>
                </div>
              </div>
              <button className={`${CLASES.boton} w-full`} onClick={() => setVista('checkout')}>
                Finalizar compra
              </button>
              <button className={`${CLASES.botonSec} w-full mt-2`} onClick={abrirMisCompras}>
                <User size={14} className="inline mr-1" />
                {cliente ? `Hola, ${cliente.nombres || 'cliente'}` : 'Ingresar / Mis compras'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (vista === 'checkout') {
    return (
      <div className="flex-1 overflow-y-auto p-5">
        <button className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-4" onClick={() => setVista('carrito')}>
          ← Volver al carrito
        </button>
        <h3 className="text-lg font-black text-slate-900 mb-1">Datos de entrega</h3>
        <p className="text-xs text-slate-400 mb-5">Completa tus datos para confirmar la compra.</p>
        {cliente && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm font-bold text-emerald-800">Comprando como {cliente.nombres} {cliente.apellidos}</p>
            <button className="text-xs font-bold text-rose-500" onClick={cerrarSesion}>Cambiar</button>
          </div>
        )}
        <form onSubmit={procesarCheckout} className="space-y-4">
          {!cliente && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className={CLASES.label}>Nombres</label>
                <input className={CLASES.input} required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} /></div>
              <div className="space-y-1.5"><label className={CLASES.label}>Apellidos</label>
                <input className={CLASES.input} value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} /></div>
              <div className="space-y-1.5"><label className={CLASES.label}>Correo</label>
                <input className={CLASES.input} type="email" required value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></div>
              <div className="space-y-1.5"><label className={CLASES.label}>Teléfono</label>
                <input className={CLASES.input} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            </div>
          )}
          <div className="space-y-1.5"><label className={CLASES.label}>Dirección de entrega</label>
            <input className={CLASES.input} required value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className={CLASES.label}>Distrito</label>
              <input className={CLASES.input} required value={form.distrito} onChange={(e) => setForm({ ...form, distrito: e.target.value })} /></div>
            <div className="space-y-1.5"><label className={CLASES.label}>Método de pago</label>
              <select className={CLASES.input} value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}>
                <option value="MERCADO_PAGO">Mercado Pago</option>
                <option value="PAYPAL">PayPal</option>
                {contraEntregaHabilitado && <option value="CONTADO">Contra entrega</option>}
              </select>
              {contraEntregaHabilitado && (
                <p className="text-[10px] font-bold text-slate-400 ml-1">
                  {contraEntregaMaximo
                    ? `Contra entrega disponible hasta S/ ${contraEntregaMaximo}`
                    : 'Contra entrega disponible'}
                </p>
              )}
            </div>
          </div>
          {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold text-slate-900">{formatearPrecio(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Envío</span>
              <span className={`font-bold ${envioGratis ? 'text-emerald-600' : 'text-slate-900'}`}>
                {envioGratis ? 'GRATIS' : costoEnvio > 0 ? formatearPrecio(costoEnvio) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900">Total</span>
              <span className="font-black text-slate-900 text-lg">{formatearPrecio(totalPedido)}</span>
            </div>
            <button className={`${CLASES.boton} w-full mt-2`} type="submit" disabled={enviando || carrito.length === 0}>
              {enviando ? 'Procesando...' : `Confirmar por ${formatearPrecio(totalPedido)}`}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (vista === 'resultado') {
    const icono = resultado?.conPago
      ? resultado.estado === 'success' ? <CheckCircle size={48} className="text-emerald-500" />
        : resultado.estado === 'pending' ? <Clock size={48} className="text-amber-500" />
          : <AlertCircle size={48} className="text-rose-500" />
      : <CheckCircle size={48} className="text-emerald-500" />;
    return (
      <div className="flex-1 overflow-y-auto p-8 text-center">
        <div className="flex justify-center mb-4">{icono}</div>
        <h3 className="text-xl font-black text-slate-900">
          {resultado?.conPago
            ? resultado.estado === 'success' ? 'Pago aprobado'
              : resultado.estado === 'pending' ? 'Pago pendiente' : 'Pago no completado'
            : 'Compra registrada'}
        </h3>
        <p className="text-sm text-slate-400 mt-2">
          Compra #{resultado?.ventaId} - {formatearPrecio(resultado?.total || 0)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {resultado?.conPago
            ? `Te abrimos la página de ${resultado.metodoPago === 'PAYPAL' ? 'PayPal' : 'pago seguro'} en otra pestaña`
            : 'Estado: ' + (resultado?.estado || 'PENDIENTE')}
        </p>
        {!cliente && (
          <button
            className={`${CLASES.botonSec} w-full mt-5`}
            onClick={() => { setAuthMode('registro'); setVista('login'); }}
          >
            Crear cuenta y ver tu historial de compras
          </button>
        )}
        <button className={`${CLASES.boton} w-full mt-3`} onClick={() => { setVista('carrito'); setDrawerAbierto(false); }}>
          Continuar comprando
        </button>
      </div>
    );
  }

  if (vista === 'compras') {
    if (!clienteToken) {
      return (
        <div className="flex-1 overflow-y-auto p-5 text-center">
          <User className="mx-auto text-slate-200 mb-3" size={48} />
          <p className="font-bold text-slate-600">Inicia sesión para ver tus compras</p>
          <p className="text-sm text-slate-400 mt-1">Podrás ver tu historial y descargar recibos</p>
          <button
            className={`${CLASES.boton} w-full mt-5`}
            onClick={() => { setAuthMode('login'); setVista('login'); }}
          >
            Ingresar
          </button>
        </div>
      );
    }
    return (
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900">Mis compras</h3>
          <button className="text-xs font-bold text-rose-500" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
        {cargandoCompras ? (
          <p className="text-sm text-slate-400">Cargando...</p>
        ) : !misCompras || misCompras.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-bold text-slate-600">No tienes compras aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {misCompras.map((v) => (
              <div key={v.id} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-900">Compra #{v.id}</strong>
                  <span className={`${CLASES.badge} ${v.estadoVenta === 'PAGADA' || v.estadoVenta === 'ENTREGADO' ? CLASES.success : CLASES.pending}`}>
                    {v.estadoVenta || v.estadoPago || 'PENDIENTE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {v.fecha ? new Date(v.fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '-'} · {formatearPrecio(v.totalVenta || 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">{(v.detalles || []).map((d) => `${d.producto?.nombre ?? d.producto} x ${d.cantidad}`).join(', ')}</p>
                {v.envio && (
                  <div className="mt-3 bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Envío</span>
                      <span className={`${CLASES.badge} ${
                        v.envio.estadoEnvio === 'ENTREGADO' ? CLASES.success
                        : v.envio.estadoEnvio === 'EN_CAMINO' ? 'bg-blue-100 text-blue-700'
                        : CLASES.pending}`}>
                        {v.envio.estadoEnvio || 'PREPARACION'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">
                      {v.envio.direccionEntrega}, {v.envio.distrito}
                    </p>
                    {v.envio.transportista && (
                      <p className="text-xs text-slate-500 mt-0.5">Transportista: {v.envio.transportista}</p>
                    )}
                    {v.envio.guiaTracking && (
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">Guía/tracking: {v.envio.guiaTracking}</p>
                    )}
                  </div>
                )}
                <button className="mt-3 text-xs font-bold text-emerald-600 inline-flex items-center gap-1.5" onClick={() => descargarRecibo(v.id)}>
                  <Download size={13} /> Descargar recibo (PDF)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <button className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-4" onClick={() => setVista('carrito')}>
        ← Volver
      </button>
      <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
        <button
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
          onClick={() => setAuthMode('login')}
        >Ingresar</button>
        <button
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${authMode === 'registro' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
          onClick={() => setAuthMode('registro')}
        >Crear cuenta</button>
      </div>
      <form onSubmit={enviarAuth} className="space-y-4">
        {authMode === 'registro' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className={CLASES.label}>Nombres</label>
              <input className={CLASES.input} name="nombres" required /></div>
            <div className="space-y-1.5"><label className={CLASES.label}>Apellidos</label>
              <input className={CLASES.input} name="apellidos" /></div>
            <div className="space-y-1.5"><label className={CLASES.label}>Teléfono</label>
              <input className={CLASES.input} name="telefono" /></div>
            <div className="space-y-1.5"><label className={CLASES.label}>Dirección</label>
              <input className={CLASES.input} name="direccion" /></div>
          </div>
        )}
        <div className="space-y-1.5"><label className={CLASES.label}>Correo</label>
          <input className={CLASES.input} name="correo" type="email" required /></div>
        <div className="space-y-1.5"><label className={CLASES.label}>Contraseña</label>
          <input className={CLASES.input} name="contrasena" type="password" required /></div>
        {authMode === 'registro' && (
          <p className="text-xs text-slate-400">Con una cuenta podrás revisar tu historial de compras y descargar tus recibos.</p>
        )}
        <button className={`${CLASES.boton} w-full`} type="submit">
          {authMode === 'registro' ? 'Crear cuenta' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
