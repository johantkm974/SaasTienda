// RUTA RELATIVA: Funciona porque HTML y Java están en el mismo servidor (8080)
const API_URL = "/api/productos";

// 1. AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", async () => {
    await cargarCombos(); 
    cargarProductos();
});

// 2. CARGAR PRODUCTOS
async function cargarProductos() {
    try {
        // CORRECCIÓN 1: Usamos la ruta general para traer TODOS los productos
        const respuesta = await fetch(API_URL);
        
        if (!respuesta.ok) {
            console.error("Error al obtener productos:", respuesta.status);
            return;
        }

        const productos = await respuesta.json();

        // CORRECCIÓN 2: Selector arreglado. El ID ya pertenece al tbody.
        const tbody = document.getElementById("tablaProductos");
        
        // Limpiamos la tabla
        tbody.innerHTML = ""; 

        productos.forEach(p => {
            // Validamos datos para evitar errores si vienen vacíos
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
                        <button onclick="llenarFormulario(${p.id}, '${p.nombre}', ${p.precioVenta}, ${p.stockActual}, '${idEmpresa}', '${idCategoria}')" 
                                style="background:#ffc107; color:black; border:none; padding:5px; border-radius:3px; cursor:pointer;">
                            Editar
                        </button>
                        <button onclick="eliminarProducto(${p.id})" 
                                style="background:#dc3545; color:white; border:none; padding:5px; border-radius:3px; cursor:pointer; margin-left:5px;">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// 3. CARGAR LISTAS DESPLEGABLES
async function cargarCombos() {
    try {
        // Cargar Empresas
        const resEmp = await fetch('/api/empresas'); 
        const empresas = await resEmp.json();
        let htmlEmp = '<option value="">Seleccione una empresa...</option>';
        empresas.forEach(e => {
            htmlEmp += `<option value="${e.id}">${e.nombreComercial || e.nombre}</option>`; 
        });
        document.getElementById("empresaSelect").innerHTML = htmlEmp;

        // Cargar Categorías
        const resCat = await fetch('/api/categorias'); 
        const categorias = await resCat.json();
        let htmlCat = '<option value="">Seleccione una categoría...</option>';
        categorias.forEach(c => {
            htmlCat += `<option value="${c.id}">${c.nombre}</option>`;
        });
        document.getElementById("categoriaSelect").innerHTML = htmlCat;

    } catch (error) {
        console.error("Error cargando listas:", error);
    }
}

// 4. GUARDAR (CREAR O EDITAR)
async function guardarProducto() {
    const id = document.getElementById("idProducto").value;
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const stock = document.getElementById("stock").value;
    const empresaId = document.getElementById("empresaSelect").value;
    const categoriaId = document.getElementById("categoriaSelect").value;

    if (!nombre || !precio || !stock || !empresaId || !categoriaId) {
        alert("Completa todos los campos, incluyendo Empresa y Categoría");
        return;
    }

    const producto = {
        nombre: nombre,
        precioVenta: parseFloat(precio),
        stockActual: parseInt(stock),
        empresa: { id: parseInt(empresaId) },
        categoria: { id: parseInt(categoriaId) }
    };

    if (id) {
        producto.id = parseInt(id);
    }

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        if (respuesta.ok) {
            alert("Producto guardado con éxito");
            limpiarFormulario();
            cargarProductos();
        } else {
            alert("Error al guardar.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// 5. ELIMINAR
async function eliminarProducto(id) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            cargarProductos();
        } else {
            alert("No se pudo eliminar (es posible que tenga ventas asociadas)");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// 6. UTILIDADES
window.llenarFormulario = (id, nombre, precio, stock, idEmpresa, idCategoria) => {
    document.getElementById("idProducto").value = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("precio").value = precio;
    document.getElementById("stock").value = stock;
    document.getElementById("empresaSelect").value = idEmpresa;
    document.getElementById("categoriaSelect").value = idCategoria;
};

function limpiarFormulario() {
    document.getElementById("idProducto").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("empresaSelect").value = "";
    document.getElementById("categoriaSelect").value = "";
}