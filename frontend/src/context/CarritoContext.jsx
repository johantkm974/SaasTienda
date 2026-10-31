import { createContext, useContext, useEffect, useState } from 'react';

const CarritoContext = createContext(null);

function cargarCarrito(empresaId) {
  try {
    return JSON.parse(localStorage.getItem(`carrito_${empresaId}`) || '[]');
  } catch {
    return [];
  }
}

function cargarCliente() {
  try {
    return JSON.parse(localStorage.getItem('clienteData') || 'null');
  } catch {
    return null;
  }
}

export function CarritoProvider({ empresaId, tienda, children }) {
  const [carrito, setCarrito] = useState(() => cargarCarrito(empresaId));
  const [clienteToken, setClienteToken] = useState(() => localStorage.getItem('clienteToken') || '');
  const [cliente, setCliente] = useState(cargarCliente);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [vistaInicial, setVistaInicial] = useState('carrito');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(`carrito_${empresaId}`, JSON.stringify(carrito));
  }, [carrito, empresaId]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  function mostrarToast(mensaje) {
    setToast(mensaje);
  }

  function agregarAlCarrito(producto) {
    const actual = carrito.find((i) => i.id === producto.id);
    if (actual && actual.cantidad >= producto.stockActual) {
      mostrarToast('No hay más stock disponible');
      return;
    }
    setCarrito((prev) => {
      const existente = prev.find((i) => i.id === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + 1, producto.stockActual) }
            : i
        );
      }
      return [...prev, {
        id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precioVenta || 0),
        stock: producto.stockActual,
        imagen: producto.imagenUrl || '',
        cantidad: 1,
      }];
    });
    mostrarToast(`${producto.nombre} agregado al carrito`);
  }

  function cambiarCantidad(id, delta) {
    const item = carrito.find((i) => i.id === id);
    if (!item) return;
    const siguiente = item.cantidad + delta;
    if (siguiente <= 0) {
      setCarrito((prev) => prev.filter((i) => i.id !== id));
      mostrarToast(`${item.nombre} eliminado del carrito`);
    } else if (siguiente > item.stock) {
      mostrarToast('No hay más stock disponible');
    } else {
      setCarrito((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad: siguiente } : i)));
    }
  }

  function quitarDelCarrito(id) {
    const item = carrito.find((i) => i.id === id);
    setCarrito((prev) => prev.filter((i) => i.id !== id));
    if (item) mostrarToast(`${item.nombre} eliminado del carrito`);
  }

  function vaciarCarrito() {
    if (carrito.length === 0) return;
    setCarrito([]);
    mostrarToast('Carrito vaciado');
  }

  function guardarSesion(data) {
    if (data && data.token) {
      localStorage.setItem('clienteToken', data.token);
      localStorage.setItem('clienteData', JSON.stringify(data.cliente || {}));
      setClienteToken(data.token);
      setCliente(data.cliente || null);
      return true;
    }
    return false;
  }

  function cerrarSesion() {
    localStorage.removeItem('clienteToken');
    localStorage.removeItem('clienteData');
    setClienteToken('');
    setCliente(null);
    mostrarToast('Sesión de cliente cerrada');
  }

  const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const contraEntregaHabilitado = tienda?.contraEntrega === true;
  const contraEntregaMaximo = tienda?.contraEntregaMaximo ?? null;

  const costoEnvio = (() => {
    const costoBase = Number(tienda?.costoEnvio ?? 0);
    if (costoBase <= 0) return 0;
    const gratisDesde = Number(tienda?.envioGratisDesde ?? 0);
    if (gratisDesde > 0 && subtotal >= gratisDesde) return 0;
    return costoBase;
  })();
  const envioGratis = costoEnvio === 0 && (Number(tienda?.costoEnvio ?? 0) > 0);
  const totalPedido = subtotal + costoEnvio;

  const valor = {
    empresaId,
    carrito,
    cantidadTotal,
    subtotal,
    costoEnvio,
    envioGratis,
    envioGratisDesde: tienda?.envioGratisDesde ?? null,
    totalPedido,
    contraEntregaHabilitado,
    contraEntregaMaximo,
    clienteToken,
    cliente,
    drawerAbierto,
    vistaInicial,
    toast,
    setDrawerAbierto,
    setVistaInicial,
    mostrarToast,
    agregarAlCarrito,
    cambiarCantidad,
    quitarDelCarrito,
    vaciarCarrito,
    guardarSesion,
    cerrarSesion,
  };

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

// Este módulo es un contexto de React: exportar el hook junto al Provider es el
// patrón habitual. La regla de fast-refresh no aplica a contextos (sin componentes
// no hay recarga caliente que perder).
// eslint-disable-next-line react-refresh/only-export-components
export function useCarrito() {
  return useContext(CarritoContext);
}
