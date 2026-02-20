-- ==========================================================
-- 1. CREACIÓN DE LA BASE DE DATOS
-- ==========================================================
DROP DATABASE IF EXISTS saas_final;
CREATE DATABASE saas_final CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saas_final;

-- ==========================================================
-- 2. TABLAS DE GESTIÓN Y ACCESO (TENANTS)
-- ==========================================================

-- Tabla EMPRESA (Tus clientes SaaS)
CREATE TABLE empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(100) NOT NULL,
    ruc char(11) not null,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('ACTIVO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    logo_url VARCHAR(255),
    telefono VARCHAR(20),
    configuracion_color VARCHAR(10) 
);

-- Tabla ROL (Global para el sistema)
CREATE TABLE rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- Admin, Vendedor, Cliente
    descripcion VARCHAR(100)
);

-- Tabla USUARIO (Vinculado a una Empresa específica)
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    dni char(8) not null,
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol_id INT,
    
    -- Restricciones
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES rol(id),
    -- Regla de negocio: El correo puede repetirse en el sistema, pero NO en la misma empresa
    UNIQUE(empresa_id, correo)
);

-- ==========================================================
-- 3. MÓDULO DE CATÁLOGO
-- ==========================================================

CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE
);

CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    categoria_id INT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    precio_venta DECIMAL(10,2) NOT NULL, -- Precio público
    stock_actual INT NOT NULL DEFAULT 0, -- Stock en tiempo real
    imagen_url VARCHAR(255),
    
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE SET NULL
);

-- ==========================================================
-- 4. MÓDULO DE COMPRAS (PROVEEDORES Y ENTRADAS)
-- ==========================================================

CREATE TABLE proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    identificacion VARCHAR(20), -- RUC, DNI
    telefono VARCHAR(20),
    correo VARCHAR(100),
    
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE
);

CREATE TABLE compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_compra DECIMAL(10,2) NOT NULL,
    numero_comprobante VARCHAR(50),
    
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
);

CREATE TABLE detalle_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL, -- Costo del proveedor
    
    FOREIGN KEY (compra_id) REFERENCES compra(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES producto(id)
);

-- ==========================================================
-- 5. MÓDULO DE VENTAS (CLIENTES Y SALIDAS)
-- ==========================================================

CREATE TABLE venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    usuario_id INT, -- Cliente (puede ser NULL si es venta anónima/rápida)
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50), -- 'Efectivo', 'Yape', 'Tarjeta' 
    estado_pago VARCHAR(50) DEFAULT 'PENDIENTE',
    
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE detalle_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL, -- Precio al momento de la venta
    subtotal DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (venta_id) REFERENCES venta(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES producto(id)
);