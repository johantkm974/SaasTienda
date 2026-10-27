const state = {
  productos: [],
  ventas: [],
  envios: [],
  usuarios: [],
  clientes: [],
  categorias: [],
  roles: [],
  banners: [],
  contenido: [],
  resumen: null,
  editingProductId: null,
  editingBannerId: null,
  editingContenidoId: null
};

let authToken = localStorage.getItem("authToken");

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN"
});

const dateFormat = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short"
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.go));
});

document.getElementById("refreshBtn").addEventListener("click", loadData);
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("loginForm").addEventListener("submit", login);
document.getElementById("productSearch").addEventListener("input", renderProducts);
document.getElementById("productForm").addEventListener("submit", saveProduct);
document.getElementById("cancelProductEditBtn").addEventListener("click", cancelProductEdit);
document.getElementById("categoryForm").addEventListener("submit", createCategory);
document.getElementById("cancelCategoryEditBtn").addEventListener("click", cancelCategoryEdit);
document.getElementById("categoryImageFile").addEventListener("change", function() {
  const preview = document.getElementById("categoryImagePreview");
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" style="max-height:80px;border-radius:6px">`; };
    reader.readAsDataURL(this.files[0]);
  } else {
    preview.innerHTML = "";
  }
});
document.getElementById("userForm").addEventListener("submit", createUser);
document.getElementById("clientForm").addEventListener("submit", createClient);
document.getElementById("saleForm").addEventListener("submit", createSale);
document.getElementById("shippingForm").addEventListener("submit", createShipping);
document.getElementById("bannerForm").addEventListener("submit", saveBanner);
document.getElementById("cancelBannerEditBtn").addEventListener("click", cancelBannerEdit);
document.getElementById("bannerImageFile").addEventListener("change", function() {
  const preview = document.getElementById("bannerImagePreview");
  if (!preview) return;
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" style="max-height:80px;border-radius:6px">`; };
    reader.readAsDataURL(this.files[0]);
  } else {
    preview.innerHTML = "";
  }
});
document.getElementById("contenidoForm").addEventListener("submit", saveContenido);
document.getElementById("cancelContenidoEditBtn").addEventListener("click", cancelContenidoEdit);
document.getElementById("contenidoVistaFilter").addEventListener("change", renderContenido);

async function loadData() {
  if (!authToken) {
    showLogin();
    return;
  }
  setStatus("Cargando datos...");
  try {
    const [resumen, productos, ventas, envios, usuarios, clientes, categorias, roles, banners, contenido] = await Promise.all([
      getJson("/api/dashboard/resumen"),
      getJson("/api/productos"),
      getJson("/api/ventas"),
      getJson("/api/envios"),
      getJson("/api/usuarios"),
      getJson("/api/clientes"),
      getJson("/api/categorias"),
      getJson("/api/roles"),
      getJson("/api/admin/banners"),
      getJson("/api/admin/contenido")
    ]);

    state.resumen = resumen;
    state.productos = productos;
    state.ventas = ventas;
    state.envios = envios;
    state.usuarios = usuarios;
    state.clientes = clientes;
    state.categorias = categorias;
    state.roles = roles;
    state.banners = banners;
    state.contenido = contenido;

    render();
    setStatus("Datos actualizados");
  } catch (error) {
    if (error.message.includes("401") || error.message.includes("403")) {
      logout();
      toast("Sesion expirada. Vuelve a iniciar sesion.");
      return;
    }
    setStatus("No se pudo conectar con la API");
    toast("No se pudo conectar con la API. Revisa que Spring Boot este corriendo.");
    console.error(error);
  }
}

async function getJson(url) {
  const response = await fetch(url, authOptions());
  if (!response.ok) {
    throw new Error(`Error ${response.status} en ${url}`);
  }
  return response.json();
}

async function sendJson(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status} en ${url}`);
  }
  return response.status === 204 ? null : response.json();
}

function render() {
  renderSelects();
  renderMetrics();
  renderFeaturedProducts();
  renderProducts();
  renderSales();
  renderClients();
  renderShippings();
  renderUsers();
  renderCategories();
  renderBanners();
  renderContenido();
}

function showView(viewName) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });

  const metrics = document.getElementById("metrics");
  if (metrics) {
    metrics.style.display = viewName === "dashboard" ? "" : "none";
  }
}

function renderSelects() {
  setOptions("productCategory", state.categorias, "idCategoria", "nombre");
  setOptions("userRole", state.roles, "idRol", "nombreRol");
  setOptions("saleClient", state.clientes.filter((client) => client.estado === "ACTIVO"), "idCliente", fullName);
  setOptions("saleSeller", state.usuarios.filter((user) => user.estado === "ACTIVO"), "idUsuario", fullName);
  setOptions("shippingSale", state.ventas, "idVenta", (venta) => `Venta #${venta.idVenta} - ${fullName(venta.cliente)}`);
}

function setOptions(id, items, valueKey, labelKey) {
  const select = document.getElementById(id);
  select.innerHTML = items.map((item) => {
    const label = typeof labelKey === "function" ? labelKey(item) : item[labelKey];
    return `<option value="${item[valueKey]}">${label}</option>`;
  }).join("");
}

function renderMetrics() {
  const resumen = state.resumen || {};
  const totalVentas = Number(resumen.totalVentas || 0);

  document.getElementById("metrics").innerHTML = [
    metric("Productos", resumen.productos || 0),
    metric("Stock total", resumen.stockTotal || 0),
    metric("Ventas", currency.format(totalVentas)),
    metric("Usuarios activos", resumen.usuariosActivos || 0),
    metric("Clientes activos", resumen.clientesActivos || 0),
    metric("Categorias", state.categorias.length),
    metric("Envios activos", resumen.enviosActivos || 0),
    metric("Ticket promedio", currency.format(state.ventas.length ? totalVentas / state.ventas.length : 0)),
    metric("Bajo stock", resumen.bajoStock || 0)
  ].join("");
}

function metric(label, value) {
  return `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`;
}

function renderFeaturedProducts() {
  const featured = [...state.productos].sort((a, b) => Number(b.precio || 0) - Number(a.precio || 0)).slice(0, 4);
  document.getElementById("featuredProducts").innerHTML = featured.map((producto) => `
    <article class="row-card">
      <img src="${producto.imagen || fallbackImage()}" alt="${producto.nombre}">
      <div>
        <strong>${producto.nombre}</strong>
        <p>${producto.marca || "Sin marca"} - ${producto.codigoSku}</p>
      </div>
      <span class="price">${currency.format(producto.precio || 0)}</span>
    </article>
  `).join(emptyRow("No hay productos registrados"));
}

function renderProducts() {
  const query = document.getElementById("productSearch").value.trim().toLowerCase();
  const productos = state.productos.filter((producto) => {
    return [producto.nombre, producto.codigoSku, producto.marca, producto.categoria?.nombre]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  document.getElementById("productCards").innerHTML = productos.length ? productos.map((producto) => `
    <article class="card product-card-row">
      <img src="${producto.imagen || fallbackImage()}" alt="${producto.nombre}">
      <div class="card-body">
        <div class="card-meta">
          ${stateBadge(producto.estado)}
          <span class="badge">${producto.categoria?.nombre || "Sin categoria"}</span>
        </div>
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion || "Sin descripcion"}</p>
        <p><strong>SKU:</strong> ${producto.codigoSku}</p>
        <p><strong>Marca:</strong> ${producto.marca || "-"}</p>
        <p><strong>Stock:</strong> ${producto.stock}</p>
        <strong class="price">${currency.format(producto.precio || 0)}</strong>
        <div class="actions">
          <button class="mini-btn" onclick="editProduct(${producto.idProducto})">Editar</button>
          ${statusButton("Product", producto.idProducto, producto.estado)}
        </div>
      </div>
    </article>
  `).join("") : emptyPanel("No hay productos para mostrar");
}

function renderSales() {
  document.getElementById("salesRows").innerHTML = state.ventas.map((venta) => `
    <tr>
      <td>#${venta.idVenta}</td>
      <td>${fullName(venta.cliente)}</td>
      <td>${formatDate(venta.fechaVenta)}</td>
      <td>${stateBadge(venta.estado)}</td>
      <td>${currency.format(venta.total || 0)}</td>
      <td>
        <div class="actions">
          <button class="mini-btn" onclick="updateSaleStatus(${venta.idVenta}, 'PAGADA')">Pagar</button>
          <button class="mini-btn danger" onclick="updateSaleStatus(${venta.idVenta}, 'CANCELADA')">Cancelar</button>
        </div>
      </td>
    </tr>
  `).join(emptyRow("No hay ventas registradas"));

  document.getElementById("latestSales").innerHTML = state.ventas.slice(0, 6).map((venta) => `
    <tr>
      <td>#${venta.idVenta}</td>
      <td>${fullName(venta.cliente)}</td>
      <td>${stateBadge(venta.estado)}</td>
      <td>${currency.format(venta.total || 0)}</td>
    </tr>
  `).join(emptyRow("No hay ventas registradas"));
}

function renderClients() {
  document.getElementById("clientRows").innerHTML = state.clientes.map((cliente) => `
    <tr>
      <td>#${cliente.idCliente}</td>
      <td>${fullName(cliente)}</td>
      <td>${cliente.correo || "-"}</td>
      <td>${cliente.telefono || "-"}</td>
      <td>${stateBadge(cliente.estado)}</td>
      <td>
        <div class="actions">
          <button class="mini-btn" onclick="showClientHistory(${cliente.idCliente})">Historial</button>
          ${statusButton("Client", cliente.idCliente, cliente.estado)}
        </div>
      </td>
    </tr>
  `).join(emptyRow("No hay clientes registrados"));
}

function renderShippings() {
  document.getElementById("shippingRows").innerHTML = state.envios.map((envio) => `
    <tr>
      <td>#${envio.idEnvio}</td>
      <td>#${envio.venta?.idVenta || "-"}</td>
      <td>${envio.direccionEntrega}</td>
      <td>${envio.distrito}</td>
      <td>${stateBadge(envio.estadoEnvio)}</td>
      <td>${currency.format(envio.costoEnvio || 0)}</td>
      <td>
        <div class="actions">
          <button class="mini-btn warn" onclick="updateShippingStatus(${envio.idEnvio}, 'EN CAMINO')">En camino</button>
          <button class="mini-btn" onclick="updateShippingStatus(${envio.idEnvio}, 'ENTREGADO')">Entregado</button>
          <button class="mini-btn danger" onclick="updateShippingStatus(${envio.idEnvio}, 'CANCELADO')">Cancelar</button>
        </div>
      </td>
    </tr>
  `).join(emptyRow("No hay envios registrados"));
}

function renderUsers() {
  document.getElementById("userRows").innerHTML = state.usuarios.map((usuario) => `
    <tr>
      <td>#${usuario.idUsuario}</td>
      <td>${fullName(usuario)}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.rol?.nombreRol || "-"}</td>
      <td>${stateBadge(usuario.estado)}</td>
      <td>
        <div class="actions">
          <button class="mini-btn danger" onclick="disableUser(${usuario.idUsuario})">Desactivar</button>
        </div>
      </td>
    </tr>
  `).join(emptyRow("No hay usuarios registrados"));
}

function renderCategories() {
  document.getElementById("categoryRows").innerHTML = state.categorias.map((categoria) => `
    <tr>
      <td>#${categoria.idCategoria}</td>
      <td>${categoria.imagenUrl ? `<img src="${categoria.imagenUrl}" alt="${categoria.nombre}" style="width:48px;height:48px;object-fit:cover;border-radius:6px">` : '<span class="muted">Sin imagen</span>'}</td>
      <td>${categoria.nombre}</td>
      <td>${(categoria.descripcion || "-").substring(0, 40)}${(categoria.descripcion || "").length > 40 ? "..." : ""}</td>
      <td>${categoria.orden || 0}</td>
      <td>${stateBadge(categoria.estado)}</td>
      <td>
        <div class="actions">
          <button class="mini-btn" onclick="editCategory(${categoria.idCategoria})">Editar</button>
          <button class="mini-btn danger" onclick="disableCategory(${categoria.idCategoria})">Desactivar</button>
        </div>
      </td>
    </tr>
  `).join(emptyRow("No hay categorias registradas"));
}

async function saveProduct(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const idProducto = form.get("idProducto");
  const currentProduct = idProducto
    ? state.productos.find((producto) => producto.idProducto === Number(idProducto))
    : null;
  const producto = {
    categoria: { idCategoria: Number(form.get("categoria")) },
    codigoSku: form.get("codigoSku"),
    nombre: form.get("nombre"),
    marca: form.get("marca"),
    precio: Number(form.get("precio")),
    stock: Number(form.get("stock")),
    imagen: form.get("imagen") || fallbackImage(),
    descripcion: form.get("descripcion"),
    estado: currentProduct?.estado || "ACTIVO"
  };
  if (idProducto) {
    await saveAndRefresh(`/api/productos/${idProducto}`, "PUT", producto, "Producto actualizado");
    cancelProductEdit();
    return;
  }
  await saveAndRefresh("/api/productos", "POST", producto, "Producto guardado");
  resetProductForm();
}

function editProduct(id) {
  const producto = state.productos.find((item) => item.idProducto === id);
  if (!producto) {
    toast("Producto no encontrado");
    return;
  }

  const form = document.getElementById("productForm");
  form.idProducto.value = producto.idProducto;
  form.categoria.value = producto.categoria?.idCategoria || "";
  form.codigoSku.value = producto.codigoSku || "";
  form.nombre.value = producto.nombre || "";
  form.marca.value = producto.marca || "";
  form.precio.value = producto.precio || 0;
  form.stock.value = producto.stock || 0;
  form.imagen.value = producto.imagen || "";
  form.descripcion.value = producto.descripcion || "";

  state.editingProductId = producto.idProducto;
  document.getElementById("productFormTitle").textContent = `Editando #${producto.idProducto}`;
  document.getElementById("productSubmitBtn").textContent = "Actualizar producto";
  document.getElementById("cancelProductEditBtn").classList.remove("hidden");
  document.getElementById("productForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelProductEdit() {
  state.editingProductId = null;
  resetProductForm();
}

function resetProductForm() {
  const form = document.getElementById("productForm");
  form.reset();
  form.idProducto.value = "";
  document.getElementById("productFormTitle").textContent = "Nuevo producto";
  document.getElementById("productSubmitBtn").textContent = "Guardar producto";
  document.getElementById("cancelProductEditBtn").classList.add("hidden");
}

async function createCategory(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  let imagenUrl = form.get("imagenUrl");
  const fileInput = document.getElementById("categoryImageFile");
  if (fileInput && fileInput.files.length > 0) {
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", fileInput.files[0]);
      const uploadHeaders = {};
      if (authToken) uploadHeaders.Authorization = `Bearer ${authToken}`;
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: uploadHeaders,
        body: uploadForm
      });
      if (!response.ok) throw new Error("Error al subir imagen");
      const data = await response.json();
      imagenUrl = data.url;
    } catch (error) {
      toast("Error al subir la imagen");
      console.error(error);
      return;
    }
  }

  const idCategoria = form.get("idCategoria");
  const categoria = {
    nombre: form.get("nombre"),
    descripcion: form.get("descripcion"),
    imagenUrl: imagenUrl,
    orden: Number(form.get("orden") || 0),
    estado: idCategoria
      ? (state.categorias.find(c => c.idCategoria === Number(idCategoria))?.estado || "ACTIVO")
      : "ACTIVO"
  };

  if (idCategoria) {
    await saveAndRefresh(`/api/categorias/${idCategoria}`, "PUT", categoria, "Categoria actualizada");
    cancelCategoryEdit();
    return;
  }
  await saveAndRefresh("/api/categorias", "POST", categoria, "Categoria guardada");
  event.currentTarget.reset();
  document.getElementById("categoryImagePreview").innerHTML = "";
}

function editCategory(id) {
  const categoria = state.categorias.find((item) => item.idCategoria === id);
  if (!categoria) {
    toast("Categoria no encontrada");
    return;
  }

  const form = document.getElementById("categoryForm");
  form.idCategoria.value = categoria.idCategoria;
  form.nombre.value = categoria.nombre || "";
  form.descripcion.value = categoria.descripcion || "";
  form.imagenUrl.value = categoria.imagenUrl || "";
  form.orden.value = categoria.orden || 0;

  const preview = document.getElementById("categoryImagePreview");
  preview.innerHTML = categoria.imagenUrl ? `<img src="${categoria.imagenUrl}" style="max-height:80px;border-radius:6px">` : "";

  document.getElementById("categoryFormTitle").textContent = `Editando #${categoria.idCategoria}`;
  document.getElementById("categorySubmitBtn").textContent = "Actualizar categoria";
  document.getElementById("cancelCategoryEditBtn").classList.remove("hidden");
  document.getElementById("categoryForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelCategoryEdit() {
  const form = document.getElementById("categoryForm");
  form.reset();
  form.idCategoria.value = "";
  document.getElementById("categoryImagePreview").innerHTML = "";
  document.getElementById("categoryFormTitle").textContent = "Nueva categoria";
  document.getElementById("categorySubmitBtn").textContent = "Guardar categoria";
  document.getElementById("cancelCategoryEditBtn").classList.add("hidden");
}

async function createUser(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await saveAndRefresh("/api/usuarios", "POST", {
    rol: { idRol: Number(form.get("rol")) },
    nombres: form.get("nombres"),
    apellidos: form.get("apellidos"),
    correo: form.get("correo"),
    telefono: form.get("telefono"),
    contrasena: form.get("contrasena"),
    estado: "ACTIVO"
  }, "Usuario guardado");
  event.currentTarget.reset();
}

async function createClient(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await saveAndRefresh("/api/clientes", "POST", {
    nombres: form.get("nombres"),
    apellidos: form.get("apellidos"),
    correo: form.get("correo"),
    telefono: form.get("telefono"),
    direccion: form.get("direccion"),
    estado: "ACTIVO"
  }, "Cliente guardado");
  event.currentTarget.reset();
}

async function createSale(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await saveAndRefresh("/api/ventas", "POST", {
    cliente: { idCliente: Number(form.get("cliente")) },
    vendedor: { idUsuario: Number(form.get("vendedor")) },
    total: Number(form.get("total")),
    estado: form.get("estado")
  }, "Venta registrada");
  event.currentTarget.reset();
}

async function createShipping(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await saveAndRefresh("/api/envios", "POST", {
    venta: { idVenta: Number(form.get("venta")) },
    direccionEntrega: form.get("direccionEntrega"),
    distrito: form.get("distrito"),
    costoEnvio: Number(form.get("costoEnvio")),
    estadoEnvio: form.get("estadoEnvio")
  }, "Envio registrado");
  event.currentTarget.reset();
}

async function updateSaleStatus(id, estado) {
  await saveAndRefresh(`/api/ventas/${id}/estado`, "PATCH", { estado }, "Estado de venta actualizado");
}

async function updateShippingStatus(id, estadoEnvio) {
  await saveAndRefresh(`/api/envios/${id}/estado`, "PATCH", { estadoEnvio }, "Estado de envio actualizado");
}

async function disableProduct(id) {
  await updateProductStatus(id, "INACTIVO");
}

async function activateProduct(id) {
  await updateProductStatus(id, "ACTIVO");
}

async function updateProductStatus(id, estado) {
  await saveAndRefresh(`/api/productos/${id}/estado`, "PATCH", { estado }, "Estado de producto actualizado");
}

async function disableUser(id) {
  await saveAndRefresh(`/api/usuarios/${id}`, "DELETE", null, "Usuario desactivado");
}

async function disableClient(id) {
  await updateClientStatus(id, "INACTIVO");
}

async function activateClient(id) {
  await updateClientStatus(id, "ACTIVO");
}

async function updateClientStatus(id, estado) {
  await saveAndRefresh(`/api/clientes/${id}/estado`, "PATCH", { estado }, "Estado de cliente actualizado");
}

async function showClientHistory(id) {
  const ventas = await getJson(`/api/ventas/cliente/${id}`);
  toast(`Cliente con ${ventas.length} venta(s) registradas`);
}

async function disableCategory(id) {
  await saveAndRefresh(`/api/categorias/${id}`, "DELETE", null, "Categoria desactivada");
}

async function saveAndRefresh(url, method, body, message) {
  try {
    if (method === "DELETE") {
      const response = await fetch(url, { method, ...authOptions() });
      if (!response.ok) {
        throw new Error(`Error ${response.status} en ${url}`);
      }
    } else {
      await sendJson(url, method, body);
    }
    toast(message);
    await loadData();
  } catch (error) {
    toast("No se pudo completar la accion");
    console.error(error);
  }
}

async function login(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: form.get("correo"),
        contrasena: form.get("contrasena")
      })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status} en login`);
    }
    const data = await response.json();
    authToken = data.token;
    localStorage.setItem("authToken", authToken);
    hideLogin();
    await loadData();
  } catch (error) {
    toast("Credenciales invalidas");
    console.error(error);
  }
}

function logout() {
  authToken = null;
  localStorage.removeItem("authToken");
  showLogin();
  setStatus("Sesion cerrada");
}

function authOptions() {
  return { headers: authHeaders() };
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

function showLogin() {
  document.body.classList.add("locked");
  document.getElementById("loginScreen").classList.add("active");
}

function hideLogin() {
  document.body.classList.remove("locked");
  document.getElementById("loginScreen").classList.remove("active");
}

function stateBadge(value) {
  const normalized = value || "SIN ESTADO";
  const kind = ["PAGADA", "ACTIVO", "ENTREGADO"].includes(normalized)
    ? "ok"
    : ["PENDIENTE", "PREPARACION", "EN CAMINO"].includes(normalized)
      ? "warn"
      : "danger";
  return `<span class="badge ${kind}">${normalized}</span>`;
}

function statusButton(kind, id, estado) {
  if (estado === "ACTIVO") {
    return `<button class="mini-btn danger" onclick="disable${kind}(${id})">Desactivar</button>`;
  }
  return `<button class="mini-btn" onclick="activate${kind}(${id})">Activar</button>`;
}

function fullName(usuario) {
  if (!usuario) {
    return "-";
  }
  return `${usuario.nombres || ""} ${usuario.apellidos || ""}`.trim();
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return dateFormat.format(new Date(value));
}

function fallbackImage() {
  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";
}

function emptyRow(text) {
  return `<tr><td class="muted" colspan="8">${text}</td></tr>`;
}

function emptyPanel(text) {
  return `<div class="empty-panel">${text}</div>`;
}

function setStatus(text) {
  document.getElementById("statusText").textContent = text;
}

function toast(message) {
  const toastElement = document.getElementById("toast");
  toastElement.textContent = message;
  toastElement.classList.add("show");
  window.clearTimeout(toastElement.timer);
  toastElement.timer = window.setTimeout(() => toastElement.classList.remove("show"), 2800);
}

/* Banners */
function renderBanners() {
  if (!state.banners.length) {
    document.getElementById("bannerRows").innerHTML = emptyRow("No hay banners registrados");
    return;
  }
  document.getElementById("bannerRows").innerHTML = state.banners.map((banner) => `
    <tr>
      <td>#${banner.idBanner}</td>
      <td>${banner.pagina || "home"}</td>
      <td>${banner.titulo || "-"}</td>
      <td>${banner.subtitulo || "-"}</td>
      <td>${banner.orden || 0}</td>
      <td>${stateBadge(banner.activo === "SI" ? "ACTIVO" : "INACTIVO")}</td>
      <td>
        <div class="actions">
          <button class="mini-btn" onclick="editBanner(${banner.idBanner})">Editar</button>
          <button class="mini-btn danger" onclick="deleteBanner(${banner.idBanner})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function editBanner(id) {
  const banner = state.banners.find((item) => item.idBanner === id);
  if (!banner) {
    toast("Banner no encontrado");
    return;
  }

  const form = document.getElementById("bannerForm");
  form.idBanner.value = banner.idBanner;
  form.titulo.value = banner.titulo || "";
  form.subtitulo.value = banner.subtitulo || "";
  form.descripcion.value = banner.descripcion || "";
  form.imagenUrl.value = banner.imagenUrl || "";
  form.enlace.value = banner.enlace || "";
  form.orden.value = banner.orden || 0;
  form.pagina.value = banner.pagina || "home";
  form.activo.value = banner.activo || "SI";

  state.editingBannerId = banner.idBanner;

  const preview = document.getElementById("bannerImagePreview");
  if (preview) preview.innerHTML = banner.imagenUrl ? `<img src="${banner.imagenUrl}" style="max-height:80px;border-radius:6px">` : "";

  document.getElementById("bannerFormTitle").textContent = `Editando #${banner.idBanner}`;
  document.getElementById("bannerSubmitBtn").textContent = "Actualizar banner";
  document.getElementById("cancelBannerEditBtn").classList.remove("hidden");
  document.getElementById("bannerForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelBannerEdit() {
  state.editingBannerId = null;
  resetBannerForm();
}

function resetBannerForm() {
  const form = document.getElementById("bannerForm");
  form.reset();
  form.idBanner.value = "";
  const preview = document.getElementById("bannerImagePreview");
  if (preview) preview.innerHTML = "";
  document.getElementById("bannerFormTitle").textContent = "Nuevo banner";
  document.getElementById("bannerSubmitBtn").textContent = "Guardar banner";
  document.getElementById("cancelBannerEditBtn").classList.add("hidden");
}

async function saveBanner(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const idBanner = form.get("idBanner");
  
  let imagenUrl = form.get("imagenUrl");
  const fileInput = document.getElementById("bannerImageFile");
  if (fileInput && fileInput.files.length > 0) {
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", fileInput.files[0]);
      const uploadHeaders = {};
      if (authToken) {
        uploadHeaders.Authorization = `Bearer ${authToken}`;
      }
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: uploadHeaders,
        body: uploadForm
      });
      if (!response.ok) throw new Error("Error al subir imagen");
      const data = await response.json();
      imagenUrl = data.url;
    } catch (error) {
      toast("Error al subir la imagen");
      console.error(error);
      return;
    }
  }
  
  const banner = {
    titulo: form.get("titulo"),
    subtitulo: form.get("subtitulo"),
    descripcion: form.get("descripcion"),
    imagenUrl: imagenUrl,
    enlace: form.get("enlace"),
    orden: Number(form.get("orden")),
    pagina: form.get("pagina"),
    activo: form.get("activo")
  };
  
  if (idBanner) {
    await saveAndRefresh(`/api/admin/banners/${idBanner}`, "PUT", banner, "Banner actualizado");
    cancelBannerEdit();
    return;
  }
  await saveAndRefresh("/api/admin/banners", "POST", banner, "Banner guardado");
  resetBannerForm();
}

async function deleteBanner(id) {
  await saveAndRefresh(`/api/admin/banners/${id}`, "DELETE", null, "Banner eliminado");
}

/* Contenido */
function renderContenido() {
  const filtro = document.getElementById("contenidoVistaFilter").value;
  let contenido = state.contenido;
  if (filtro) {
    contenido = contenido.filter((item) => item.vista === filtro);
  }

  if (!contenido.length) {
    document.getElementById("contenidoRows").innerHTML = emptyRow("No hay contenido registrado");
    return;
  }

  const nombresVistas = {
    home: "Inicio (inicio.html)",
    tienda: "Tienda (tienda.html)",
    login: "Login (index.html)",
    productos: "Productos (productos.html)",
    nosotros: "Nosotros (nosotros.html)",
    contactanos: "Contacto (contactanos.html)",
    footer: "Footer (todas las paginas)"
  };

  document.getElementById("contenidoRows").innerHTML = contenido.map((item) => `
    <tr>
      <td>#${item.idContenido}</td>
      <td>${nombresVistas[item.vista] || item.vista}</td>
      <td>${item.clave}</td>
      <td>${(item.valorTexto || "-").substring(0, 50)}${(item.valorTexto || "").length > 50 ? "..." : ""}</td>
      <td>${stateBadge(item.activo === "SI" ? "ACTIVO" : "INACTIVO")}</td>
      <td>
        <div class="actions">
          <button class="mini-btn" onclick="editContenido(${item.idContenido})">Editar</button>
          <button class="mini-btn danger" onclick="deleteContenido(${item.idContenido})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function editContenido(id) {
  const contenido = state.contenido.find((item) => item.idContenido === id);
  if (!contenido) {
    toast("Contenido no encontrado");
    return;
  }

  const form = document.getElementById("contenidoForm");
  form.idContenido.value = contenido.idContenido;
  form.vista.value = contenido.vista || "";
  form.clave.value = contenido.clave || "";
  form.valorTexto.value = contenido.valorTexto || "";
  form.imagenUrl.value = contenido.imagenUrl || "";
  form.activo.value = contenido.activo || "SI";

  state.editingContenidoId = contenido.idContenido;
  document.getElementById("contenidoFormTitle").textContent = `Editando #${contenido.idContenido}`;
  document.getElementById("contenidoSubmitBtn").textContent = "Actualizar contenido";
  document.getElementById("cancelContenidoEditBtn").classList.remove("hidden");
  document.getElementById("contenidoForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelContenidoEdit() {
  state.editingContenidoId = null;
  resetContenidoForm();
}

function resetContenidoForm() {
  const form = document.getElementById("contenidoForm");
  form.reset();
  form.idContenido.value = "";
  document.getElementById("contenidoFormTitle").textContent = "Nuevo contenido";
  document.getElementById("contenidoSubmitBtn").textContent = "Guardar contenido";
  document.getElementById("cancelContenidoEditBtn").classList.add("hidden");
}

async function saveContenido(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const idContenido = form.get("idContenido");
  const contenido = {
    vista: form.get("vista"),
    clave: form.get("clave"),
    valorTexto: form.get("valorTexto"),
    imagenUrl: form.get("imagenUrl"),
    activo: form.get("activo")
  };
  
  if (idContenido) {
    await saveAndRefresh(`/api/admin/contenido/${idContenido}`, "PUT", contenido, "Contenido actualizado");
    cancelContenidoEdit();
    return;
  }
  await saveAndRefresh("/api/admin/contenido", "POST", contenido, "Contenido guardado");
  resetContenidoForm();
}

async function deleteContenido(id) {
  await saveAndRefresh(`/api/admin/contenido/${id}`, "DELETE", null, "Contenido eliminado");
}

loadData();
