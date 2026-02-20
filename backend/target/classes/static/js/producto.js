const API_URL = "/api/productos";

// Función auxiliar para obtener el token y evitar repetir código
function obtenerToken() {
    const token = localStorage.getItem('token_tienda');
    if (!token) {
        window.location.href = "/html/login.html";
        return null;
    }
    return token;
}

// 1. AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", async () => {
    const token = obtenerToken();
    if (token) {
        await cargarCombos(token); 
        cargarProductos(token);
    }
});

// 2. CARGAR PRODUCTOS
async function cargarProductos(token) {
    try {
        const respuesta = await fetch(API_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (respuesta.status === 403) {
            window.location.href = "/html/login.html";
            return;
        }

        const productos = await respuesta.json();
        const tbody = document.getElementById("tablaProductos");
        tbody.innerHTML = ""; 

        productos.forEach(p => {
            const nomEmpresa = p.empresa ? (p.empresa.nombreComercial || p.empresa.nombre) : 'Sin Empresa';
            const nomCategoria = p.categoria ? p.categoria.nombre : 'Sin Categoría';
            const idEmpresa = p.empresa ? p.empresa.id : '';
            const idCategoria = p.categoria ? p.categoria.id : '';

            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.nombre}</td>
                    <td>S/ ${p.precioVenta}</td>
                    <td>${p.stockActual}</td>
                    <td>${nomEmpresa}</td>
                    <td>${nomCategoria}</td>
                    <td>
                        <button onclick="llenarFormulario(${p.id}, '${p.nombre}', ${p.precioVenta}, ${p.stockActual}, '${idEmpresa}', '${idCategoria}')" class="btn-edit">Editar</button>
                        <button onclick="eliminarProducto(${p.id})" class="btn-delete">Eliminar</button>
                    </td>
                </tr>`;
        });
    } catch (error) { console.error("Error:", error); }
}

// 3. CARGAR LISTAS DESPLEGABLES (También necesitan Token)
async function cargarCombos(token) {
    try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const resEmp = await fetch('/api/empresas', { headers }); 
        const empresas = await resEmp.json();
        let htmlEmp = '<option value="">Seleccione una empresa...</option>';
        empresas.forEach(e => htmlEmp += `<option value="${e.id}">${e.nombreComercial || e.nombre}</option>`);
        document.getElementById("empresaSelect").innerHTML = htmlEmp;

        const resCat = await fetch('/api/categorias', { headers }); 
        const categorias = await resCat.json();
        let htmlCat = '<option value="">Seleccione una categoría...</option>';
        categorias.forEach(c => htmlCat += `<option value="${c.id}">${c.nombre}</option>`);
        document.getElementById("categoriaSelect").innerHTML = htmlCat;
    } catch (error) { console.error("Error:", error); }
}

// 4. GUARDAR (Necesita Token)
async function guardarProducto() {
    const token = obtenerToken();
    const id = document.getElementById("idProducto").value;
    // ... (obtener los demás campos igual que antes)

    const producto = {
        nombre: document.getElementById("nombre").value,
        precioVenta: parseFloat(document.getElementById("precio").value),
        stockActual: parseInt(document.getElementById("stock").value),
        empresa: { id: parseInt(document.getElementById("empresaSelect").value) },
        categoria: { id: parseInt(document.getElementById("categoriaSelect").value) }
    };
    if (id) producto.id = parseInt(id);

    const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(producto)
    });

    if (respuesta.ok) {
        alert("¡Guardado!");
        limpiarFormulario();
        cargarProductos(token);
    }
}

// 5. ELIMINAR (Necesita Token)
async function eliminarProducto(id) {
    const token = obtenerToken();
    if (!confirm("¿Eliminar?")) return;

    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (respuesta.ok) cargarProductos(token);
}