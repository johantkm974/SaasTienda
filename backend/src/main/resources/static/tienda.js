const state = {
  productos: [],
  carrito: new Map(),
  authToken: localStorage.getItem("clienteToken"),
  cliente: JSON.parse(localStorage.getItem("clienteData") || "null"),
  authMode: "login",
  selectedCategory: "all"
};

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN"
});

const dateFormat = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short"
});

document.getElementById("searchInput").addEventListener("input", renderProductos);
document.getElementById("accountBtn").addEventListener("click", openAuth);
document.getElementById("ordersBtn").addEventListener("click", openOrders);
document.getElementById("closeAuthBtn").addEventListener("click", () => document.getElementById("authModal").close());
document.getElementById("closeOrdersBtn").addEventListener("click", () => document.getElementById("ordersModal").close());
document.getElementById("authForm").addEventListener("submit", submitAuth);
document.getElementById("checkoutForm").addEventListener("submit", checkout);
document.getElementById("logoutBtn").addEventListener("click", logout);
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.mode));
});

function loadCarritoFromStorage() {
  try {
    const saved = localStorage.getItem("carritoData");
    if (saved) {
      const parsed = JSON.parse(saved);
      state.carrito = new Map(Object.entries(parsed));
    }
  } catch (e) {
    state.carrito = new Map();
  }
}

function saveCarritoToStorage() {
  const obj = Object.fromEntries(state.carrito);
  localStorage.setItem("carritoData", JSON.stringify(obj));
}

function getCarritoCount() {
  let count = 0;
  for (const cantidad of state.carrito.values()) {
    count += cantidad;
  }
  return count;
}

function updateCartBadge() {
  const count = getCarritoCount();
  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
    if (count > 0) {
      badge.classList.add("pulse");
      setTimeout(() => badge.classList.remove("pulse"), 300);
    }
  }
  const headerCount = document.getElementById("cartCount");
  if (headerCount) {
    headerCount.textContent = count > 0 ? `(${count})` : "";
  }
}

async function loadProductos() {
  try {
    const response = await fetch("/api/tienda/productos");
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    state.productos = await response.json();
    document.getElementById("catalogStatus").textContent = `${state.productos.length} producto(s) disponibles`;
    loadCarritoFromStorage();
    renderFilterTags();
    renderProductos();
    renderCarrito();
    renderAccount();
    updateCartBadge();
    addPendingProduct();
  } catch (error) {
    document.getElementById("catalogStatus").textContent = "No se pudo cargar el catalogo";
    toast("Revisa que Spring Boot este corriendo");
    console.error(error);
  }
}

function renderFilterTags() {
  const categories = [...new Set(state.productos.map(p => p.categoria).filter(Boolean))];
  const container = document.getElementById("filterTags");
  container.innerHTML = `
    <button class="filter-tag${state.selectedCategory === "all" ? " active" : ""}" data-category="all">Todos</button>
    ${categories.map(cat => `
      <button class="filter-tag${state.selectedCategory === cat ? " active" : ""}" data-category="${cat}">${cat}</button>
    `).join("")}
  `;
  container.querySelectorAll(".filter-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      state.selectedCategory = tag.dataset.category;
      container.querySelectorAll(".filter-tag").forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      renderProductos();
    });
  });
}

function renderProductos() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const productos = state.productos.filter((producto) => {
    const matchesSearch = [producto.nombre, producto.marca, producto.codigoSku, producto.categoria]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesCategory = state.selectedCategory === "all" || producto.categoria === state.selectedCategory;
    return matchesSearch && matchesCategory;
  });

  document.getElementById("productGrid").innerHTML = productos.length ? productos.map((producto) => {
    const enCarrito = state.carrito.get(producto.idProducto) || 0;
    const stockBajo = producto.stock <= 5;
    return `
    <article class="product-card" data-id="${producto.idProducto}">
      <img src="${producto.imagen || fallbackImage()}" alt="${producto.nombre}">
      <div class="product-body">
        <div class="meta-row">
          <span class="badge">${producto.categoria || "Catalogo"}</span>
          <span class="muted ${stockBajo ? 'stock-warning' : ''}">${producto.stock} en stock</span>
        </div>
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion || "Producto disponible para compra online."}</p>
        <div class="product-footer">
          <strong class="price">${currency.format(producto.precio || 0)}</strong>
          <div class="add-actions">
            ${enCarrito > 0 ? `
              <span class="in-cart-badge">${enCarrito} en carrito</span>
            ` : ''}
            <button class="primary-btn add-btn" type="button" onclick="addToCart(${producto.idProducto})">
              <span class="btn-icon">+</span> Agregar
            </button>
          </div>
        </div>
      </div>
    </article>
  `}).join("") : emptyPanel("No hay productos para mostrar");
}

function addToCart(idProducto) {
  const producto = state.productos.find((item) => item.idProducto === idProducto);
  if (!producto) return;
  const actual = state.carrito.get(idProducto) || 0;
  if (actual >= producto.stock) {
    toast("No hay mas stock disponible");
    return;
  }
  state.carrito.set(idProducto, actual + 1);
  saveCarritoToStorage();
  updateCartBadge();
  renderCarrito();
  renderProductos();

  const card = document.querySelector(`.product-card[data-id="${idProducto}"]`);
  if (card) {
    card.classList.add("added-animation");
    setTimeout(() => card.classList.remove("added-animation"), 600);
  }

  toast(`${producto.nombre} agregado al carrito`);
}

function updateCart(idProducto, delta) {
  const producto = state.productos.find((item) => item.idProducto === idProducto);
  if (!producto) return;
  const next = (state.carrito.get(idProducto) || 0) + delta;
  if (next <= 0) {
    state.carrito.delete(idProducto);
    toast(`${producto.nombre} eliminado del carrito`);
  } else if (next <= producto.stock) {
    state.carrito.set(idProducto, next);
  } else {
    toast("No hay mas stock disponible");
    return;
  }
  saveCarritoToStorage();
  updateCartBadge();
  renderCarrito();
  renderProductos();
}

function removeFromCart(idProducto) {
  const producto = state.productos.find((item) => item.idProducto === idProducto);
  state.carrito.delete(idProducto);
  saveCarritoToStorage();
  updateCartBadge();
  renderCarrito();
  renderProductos();
  if (producto) {
    toast(`${producto.nombre} eliminado del carrito`);
  }
}

function clearCart() {
  if (state.carrito.size === 0) return;
  if (!confirm("Vacias todo el carrito?")) return;
  state.carrito.clear();
  saveCarritoToStorage();
  updateCartBadge();
  renderCarrito();
  renderProductos();
  toast("Carrito vaciado");
}

function renderCarrito() {
  const items = [...state.carrito.entries()].map(([idProducto, cantidad]) => {
    const producto = state.productos.find((item) => item.idProducto === idProducto);
    return { producto, cantidad };
  }).filter((item) => item.producto);

  const cartItemsEl = document.getElementById("cartItems");

  if (items.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="m1 1 4 2 3 9h13l3-11H6"></path>
          </svg>
        </div>
        <p>Tu carrito esta vacio</p>
        <span>Agrega productos del catalogo</span>
      </div>
    `;
  } else {
    cartItemsEl.innerHTML = items.map(({ producto, cantidad }) => {
      const subtotalLinea = Number(producto.precio) * cantidad;
      const stockMax = producto.stock;
      return `
      <div class="cart-item" data-id="${producto.idProducto}">
        <img class="cart-item-img" src="${producto.imagen || fallbackImage()}" alt="${producto.nombre}">
        <div class="cart-item-info">
          <div class="cart-item-head">
            <strong class="cart-item-name">${producto.nombre}</strong>
            <button class="remove-btn" type="button" onclick="removeFromCart(${producto.idProducto})" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <span class="cart-item-price">${currency.format(producto.precio)}</span>
          <div class="cart-item-controls">
            <button class="qty-btn" type="button" onclick="updateCart(${producto.idProducto}, -1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span class="qty-display">${cantidad}</span>
            <button class="qty-btn ${cantidad >= stockMax ? 'qty-disabled' : ''}" type="button" onclick="updateCart(${producto.idProducto}, 1)" ${cantidad >= stockMax ? 'disabled' : ''}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <span class="cart-item-subtotal">${currency.format(subtotalLinea)}</span>
        </div>
      </div>
    `}).join("");
  }

  const subtotalVal = subtotal();
  document.getElementById("cartSubtotal").textContent = currency.format(subtotalVal);
  document.getElementById("cartShipping").textContent = "--";
  document.getElementById("cartTotal").textContent = currency.format(subtotalVal);
  document.getElementById("cartCount").textContent = getCarritoCount() > 0 ? `(${getCarritoCount()})` : "";

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.disabled = items.length === 0;
  }
}

function subtotal() {
  return [...state.carrito.entries()].reduce((total, [idProducto, cantidad]) => {
    const producto = state.productos.find((item) => item.idProducto === idProducto);
    return total + Number(producto?.precio || 0) * cantidad;
  }, 0);
}

function openAuth() {
  if (state.authToken) return;
  document.getElementById("authModal").showModal();
}

function logout() {
  state.authToken = null;
  state.cliente = null;
  localStorage.removeItem("clienteToken");
  localStorage.removeItem("clienteData");
  renderAccount();
  toast("Sesion de cliente cerrada");
}

function setAuthMode(mode) {
  state.authMode = mode;
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });
  document.getElementById("registerFields").classList.toggle("active", mode === "registro");
  document.getElementById("authTitle").textContent = mode === "registro" ? "Crear cuenta de cliente" : "Ingresar como cliente";
}

async function submitAuth(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = {
    correo: form.get("correo"),
    contrasena: form.get("contrasena")
  };
  if (state.authMode === "registro") {
    body.nombres = form.get("nombres");
    body.apellidos = form.get("apellidos");
    body.telefono = form.get("telefono");
    body.direccion = form.get("direccion");
  }

  try {
    const response = await fetch(`/api/tienda/${state.authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const data = await response.json();
    state.authToken = data.token;
    state.cliente = data.cliente;
    localStorage.setItem("clienteToken", data.token);
    localStorage.setItem("clienteData", JSON.stringify(data.cliente));
    renderAccount();
    document.getElementById("authModal").close();
    toast("Sesion de cliente iniciada");
  } catch (error) {
    toast("No se pudo iniciar sesion o registrar");
    console.error(error);
  }
}

async function checkout(event) {
  event.preventDefault();
  if (state.carrito.size === 0) {
    toast("Agrega productos al carrito");
    return;
  }

  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creando orden...';

  const form = new FormData(event.currentTarget);
  const body = {
    items: [...state.carrito.entries()].map(([idProducto, cantidad]) => ({ idProducto, cantidad })),
    nombres: form.get("nombres"),
    apellidos: form.get("apellidos"),
    correo: form.get("correo"),
    telefono: form.get("telefono"),
    direccionEntrega: form.get("direccionEntrega"),
    distrito: form.get("distrito"),
    conPago: true
  };

  try {
    const response = await fetch("/api/tienda/checkout/publico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error || `Error ${response.status}`);
    }
    const data = await response.json();
    if (data.initPoint) {
      state.carrito.clear();
      saveCarritoToStorage();
      updateCartBadge();
      renderCarrito();
      window.location.href = data.initPoint;
    } else {
      showOrderConfirmation({
        idVenta: data.idVenta,
        total: data.total,
        estado: data.estadoVenta || data.estadoPago
      });
      btn.disabled = false;
      btn.innerHTML = "Confirmar compra";
    }
  } catch (error) {
    toast(error.message || "No se pudo completar la compra");
    console.error(error);
    btn.disabled = false;
    btn.innerHTML = "Confirmar compra";
  }
}

function showOrderConfirmation(venta) {
  const modal = document.getElementById("ordersModal");
  const list = document.getElementById("ordersList");
  list.innerHTML = `
    <div class="order-success">
      <div class="success-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h3>Compra registrada</h3>
      <p class="muted">Compra #${venta.idVenta} - ${currency.format(venta.total || 0)}</p>
      <p class="muted">Estado: ${venta.estado}</p>
      <button class="primary-btn" onclick="document.getElementById('ordersModal').close()">Continuar comprando</button>
    </div>
  `;
  modal.showModal();
}

async function openOrders() {
  if (!state.authToken) {
    toast("Ingresa a tu cuenta para ver tus compras");
    document.getElementById("authModal").showModal();
    return;
  }
  try {
    const response = await fetch("/api/tienda/mis-compras", { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const compras = await response.json();
    document.getElementById("ordersList").innerHTML = compras.length ? compras.map((venta) => `
      <article class="order-card">
        <div class="order-head">
          <strong>Compra #${venta.idVenta}</strong>
          <span class="badge">${venta.estado}</span>
        </div>
        <p class="muted">${formatDate(venta.fechaVenta)} - ${currency.format(venta.total || 0)}</p>
        <p>${venta.detalles.map((detalle) => `${detalle.producto} x ${detalle.cantidad}`).join(", ")}</p>
        <p class="muted">Envio: ${venta.envio?.estadoEnvio || "Sin envio"}</p>
      </article>
    `).join("") : `
      <div class="empty-cart">
        <p>No tienes compras aun</p>
        <span>Explora nuestro catalogo</span>
      </div>
    `;
    document.getElementById("ordersModal").showModal();
  } catch (error) {
    toast("No se pudieron cargar tus compras");
    console.error(error);
  }
}

function renderAccount() {
  const btn = document.getElementById("accountBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  if (state.authToken) {
    btn.textContent = state.cliente?.nombres ? state.cliente.nombres : "Mi cuenta";
    btn.classList.add("logged-in");
    logoutBtn.style.display = "inline-flex";
  } else {
    btn.textContent = "Ingresar";
    btn.classList.remove("logged-in");
    logoutBtn.style.display = "none";
  }
  if (state.cliente?.direccion) {
    const dirInput = document.querySelector("[name='direccionEntrega']");
    if (dirInput && !dirInput.value) {
      dirInput.value = state.cliente.direccion;
    }
  }
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.authToken}`
  };
}

function formatDate(value) {
  return value ? dateFormat.format(new Date(value)) : "-";
}

function fallbackImage() {
  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";
}

function emptyMessage(text) {
  return `<p class="muted">${text}</p>`;
}

function emptyPanel(text) {
  return `<div class="empty-panel">${text}</div>`;
}

function comprarAhora(idProducto, categoria) {
  localStorage.setItem("pendingProduct", String(idProducto));
  if (categoria) {
    localStorage.setItem("pendingCategory", categoria);
  }
  window.location.href = "tienda.html";
}

function addPendingProduct() {
  const pendingId = localStorage.getItem("pendingProduct");
  const pendingCat = localStorage.getItem("pendingCategory");
  if (pendingCat) {
    state.selectedCategory = pendingCat;
    localStorage.removeItem("pendingCategory");
  }
  if (!pendingId) {
    if (pendingCat) {
      renderFilterTags();
      renderProductos();
    }
    return;
  }
  localStorage.removeItem("pendingProduct");
  const id = Number(pendingId);
  const producto = state.productos.find((p) => p.idProducto === id);
  if (!producto) return;
  const actual = state.carrito.get(id) || 0;
  if (actual < producto.stock) {
    state.carrito.set(id, actual + 1);
    saveCarritoToStorage();
    updateCartBadge();
    renderFilterTags();
    renderProductos();
    renderCarrito();
    toast(`${producto.nombre} añadido al carrito`);
    setTimeout(() => {
      document.getElementById("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  }
}

function toast(message) {
  const toastElement = document.getElementById("toast");
  toastElement.textContent = message;
  toastElement.classList.add("show");
  window.clearTimeout(toastElement.timer);
  toastElement.timer = window.setTimeout(() => toastElement.classList.remove("show"), 2800);
}

function handlePaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get("payment");
  const idVenta = params.get("id_venta");

  if (!paymentStatus) return;

  window.history.replaceState({}, "", "/tienda.html");

  const modal = document.getElementById("ordersModal");
  const list = document.getElementById("ordersList");

  if (paymentStatus === "success") {
    list.innerHTML = `
      <div class="order-success">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3>Pago aprobado</h3>
        <p class="muted">Tu compra #${idVenta || ''} ha sido confirmada</p>
        <p class="muted">Recibiras un correo con los detalles de tu pedido</p>
        <button class="primary-btn" onclick="document.getElementById('ordersModal').close()">Continuar comprando</button>
      </div>
    `;
  } else if (paymentStatus === "pending") {
    list.innerHTML = `
      <div class="order-success">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h3>Pago pendiente</h3>
        <p class="muted">Tu compra #${idVenta || ''} esta esperando confirmacion</p>
        <p class="muted">Te notificaremos cuando se complete el pago</p>
        <button class="primary-btn" onclick="document.getElementById('ordersModal').close()">Continuar comprando</button>
      </div>
    `;
  } else {
    list.innerHTML = `
      <div class="order-success">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e02424" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>Pago no completado</h3>
        <p class="muted">Tu compra #${idVenta || ''} no pudo ser procesada</p>
        <p class="muted">Puedes intentar nuevamente desde tu carrito</p>
        <button class="primary-btn" onclick="document.getElementById('ordersModal').close()">Volver a la tienda</button>
      </div>
    `;
  }

  modal.showModal();
}

async function loadTiendaContenido() {
  try {
    const [contenidoResponse, bannersResponse] = await Promise.all([
      fetch('/api/contenido/tienda'),
      fetch('/api/contenido/banners?pagina=tienda')
    ]);

    if (contenidoResponse.ok) {
      const contenido = await contenidoResponse.json();
      if (contenido.titulo_principal) document.getElementById('tiendaTitulo').textContent = contenido.titulo_principal;
      if (contenido.subtitulo_principal) document.getElementById('tiendaSubtitulo').textContent = contenido.subtitulo_principal;
      if (contenido.eyebrow) document.getElementById('tiendaEyebrow').textContent = contenido.eyebrow;
      if (contenido.texto_boton) document.getElementById('tiendaBtn').textContent = contenido.texto_boton;
      if (contenido.imagen_fondo) document.getElementById('tiendaHero').style.backgroundImage = `url('${contenido.imagen_fondo}')`;
    }

    if (bannersResponse.ok) {
      const banners = await bannersResponse.json();
      if (banners.length > 0) {
        const banner = banners[0];
        if (banner.imagenUrl) document.getElementById('tiendaHero').style.backgroundImage = `url('${banner.imagenUrl}')`;
        if (banner.titulo) document.getElementById('tiendaEyebrow').textContent = banner.titulo;
        if (banner.subtitulo) document.getElementById('tiendaTitulo').textContent = banner.subtitulo;
        if (banner.descripcion) document.getElementById('tiendaSubtitulo').textContent = banner.descripcion;
      }
    }
  } catch (e) {}
}

loadTiendaContenido();
loadProductos();
handlePaymentReturn();
