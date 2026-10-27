-- ===================================================================
-- V1: Esquema inicial del SaaS (BodegaControl)
-- Correspondencia exacta con las entidades JPA.
-- Incluye columnas de auditorÃ­a (created_at/updated_at/created_by/updated_by)
-- y borrado lÃ³gico (activo) donde aplica.
-- ===================================================================

CREATE TABLE rol (
    id          INT          NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE empresa (
    id               INT           NOT NULL AUTO_INCREMENT,
    nombre_comercial VARCHAR(100)  NOT NULL,
    ruc              VARCHAR(11)   NOT NULL,
    fecha_registro   DATETIME(6)   DEFAULT CURRENT_TIMESTAMP(6),
    estado           VARCHAR(255),
    logo_url         VARCHAR(255),
    telefono         VARCHAR(255),
    created_at       DATETIME(6),
    updated_at       DATETIME(6),
    created_by       VARCHAR(255),
    updated_by       VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuario (
    id               INT           NOT NULL AUTO_INCREMENT,
    empresa_id       INT,
    nombre           VARCHAR(255)  NOT NULL,
    dni              VARCHAR(255)  NOT NULL,
    correo           VARCHAR(255)  NOT NULL,
    contrasena       VARCHAR(255)  NOT NULL,
    rol_id           INT,
    intentos_fallidos INT          NOT NULL DEFAULT 0,
    bloqueado_hasta  DATETIME(6),
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       DATETIME(6),
    updated_at       DATETIME(6),
    created_by       VARCHAR(255),
    updated_by       VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_usuario_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
    CONSTRAINT fk_usuario_rol     FOREIGN KEY (rol_id)     REFERENCES rol (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categoria (
    id          INT          NOT NULL AUTO_INCREMENT,
    empresa_id  INT,
    nombre      VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  DATETIME(6),
    updated_at  DATETIME(6),
    created_by  VARCHAR(255),
    updated_by  VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_categoria_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE proveedor (
    id             INT           NOT NULL AUTO_INCREMENT,
    empresa_id     INT           NOT NULL,
    nombre         VARCHAR(255)  NOT NULL,
    identificacion VARCHAR(20),
    telefono       VARCHAR(20),
    correo         VARCHAR(100),
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     DATETIME(6),
    updated_at     DATETIME(6),
    created_by     VARCHAR(255),
    updated_by     VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_proveedor_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE producto (
    id           INT            NOT NULL AUTO_INCREMENT,
    empresa_id   INT            NOT NULL,
    categoria_id INT,
    nombre       VARCHAR(255)   NOT NULL,
    descripcion  VARCHAR(255),
    precio_venta DECIMAL(10, 2) NOT NULL,
    stock_actual INT            NOT NULL,
    stock_minimo INT            NOT NULL,
    imagen_url   VARCHAR(255),
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   DATETIME(6),
    updated_at   DATETIME(6),
    created_by   VARCHAR(255),
    updated_by   VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_producto_empresa   FOREIGN KEY (empresa_id)   REFERENCES empresa (id),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE compra (
    id                 INT            NOT NULL AUTO_INCREMENT,
    empresa_id         INT            NOT NULL,
    proveedor_id       INT            NOT NULL,
    fecha              DATETIME(6),
    total_compra       DECIMAL(10, 2) NOT NULL,
    numero_comprobante VARCHAR(50),
    created_at         DATETIME(6),
    updated_at         DATETIME(6),
    created_by         VARCHAR(255),
    updated_by         VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_compra_empresa   FOREIGN KEY (empresa_id)   REFERENCES empresa (id),
    CONSTRAINT fk_compra_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE detalle_compra (
    id             INT            NOT NULL AUTO_INCREMENT,
    compra_id      INT            NOT NULL,
    producto_id    INT            NOT NULL,
    cantidad       INT            NOT NULL,
    costo_unitario DECIMAL(10, 2) NOT NULL,
    subtotal       DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_detalle_compra_compra   FOREIGN KEY (compra_id)   REFERENCES compra (id),
    CONSTRAINT fk_detalle_compra_producto FOREIGN KEY (producto_id) REFERENCES producto (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE venta (
    id          INT            NOT NULL AUTO_INCREMENT,
    empresa_id  INT            NOT NULL,
    usuario_id  INT,
    fecha       DATETIME(6),
    total_venta DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50),
    estado_pago VARCHAR(50),
    created_at  DATETIME(6),
    updated_at  DATETIME(6),
    created_by  VARCHAR(255),
    updated_by  VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_venta_empresa FOREIGN KEY (empresa_id) REFERENCES empresa (id),
    CONSTRAINT fk_venta_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE detalle_venta (
    id             INT            NOT NULL AUTO_INCREMENT,
    venta_id       INT            NOT NULL,
    producto_id    INT            NOT NULL,
    cantidad       INT            NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal       DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_detalle_venta_venta   FOREIGN KEY (venta_id)   REFERENCES venta (id),
    CONSTRAINT fk_detalle_venta_producto FOREIGN KEY (producto_id) REFERENCES producto (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

