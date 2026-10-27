-- V5: Fusión SV Electrónicos — clientes como tabla aparte, pagos, envíos, banners, contenido

-- Cliente: tabla separada del sistema de usuarios (sin login por ahora, password_hash para futuro)
CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NULL,
    direccion VARCHAR(255) NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    password_hash VARCHAR(255) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
    CONSTRAINT uq_cliente_correo_empresa UNIQUE (empresa_id, correo)
);

-- Venta: estado de la venta y vínculo con el cliente (tabla aparte)
ALTER TABLE venta ADD COLUMN estado_venta VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE_PAGO';
ALTER TABLE venta ADD COLUMN cliente_id INT NULL;
ALTER TABLE venta ADD CONSTRAINT fk_venta_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id);

-- Producto: marca
ALTER TABLE producto ADD COLUMN marca VARCHAR(100) NULL;

-- Envíos
CREATE TABLE envio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    empresa_id INT NOT NULL,
    direccion_entrega VARCHAR(255) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    costo_envio DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado_envio VARCHAR(20) NOT NULL DEFAULT 'PREPARACION',
    fecha_despacho DATETIME NULL,
    fecha_entrega DATETIME NULL,
    CONSTRAINT fk_envio_venta FOREIGN KEY (venta_id) REFERENCES venta(id),
    CONSTRAINT fk_envio_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

-- Pagos (MercadoPago)
CREATE TABLE pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    empresa_id INT NOT NULL,
    proveedor VARCHAR(30) NOT NULL,
    external_id VARCHAR(200) NULL,
    preference_id VARCHAR(200) NULL,
    payment_id_mp VARCHAR(200) NULL,
    init_point TEXT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    monto DECIMAL(10,2) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion DATETIME NULL,
    CONSTRAINT fk_pago_venta FOREIGN KEY (venta_id) REFERENCES venta(id),
    CONSTRAINT fk_pago_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

-- Banners por tienda
CREATE TABLE banner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    subtitulo VARCHAR(200) NULL,
    descripcion TEXT NULL,
    imagen_url TEXT NULL,
    enlace VARCHAR(255) NULL,
    orden INT NOT NULL DEFAULT 0,
    pagina VARCHAR(50) NOT NULL DEFAULT 'tienda',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_banner_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

-- Contenido de página por tienda
CREATE TABLE contenido_pagina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    vista VARCHAR(50) NOT NULL,
    clave VARCHAR(100) NOT NULL,
    valor_texto TEXT NULL,
    imagen_url TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_contenido_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
    CONSTRAINT uq_contenido_vista_clave UNIQUE (empresa_id, vista, clave)
);
