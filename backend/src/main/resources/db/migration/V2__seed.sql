-- ===================================================================
-- V2: Datos semilla (roles, superadmin del SaaS, empresas, admins,
-- categorías, productos y proveedores de demostración).
-- Contraseña de TODOS los usuarios semilla: 12345678 (BCrypt).
-- ===================================================================

-- Roles
INSERT INTO rol (id, nombre, descripcion) VALUES
    (1, 'Administrador', 'Acceso total a la tienda'),
    (2, 'Vendedor', 'Ventas y consultas de inventario'),
    (3, 'Cliente', 'Comprador final'),
    (4, 'SUPREMO', 'Administrador global del SaaS: controla todas las empresas');

-- Superadmin del SaaS (no pertenece a ninguna empresa)
INSERT INTO usuario (id, empresa_id, nombre, dni, correo, contrasena, rol_id) VALUES
    (1, NULL, 'Super Admin SaaS', '00000000', 'supremo@saas.local',
     '$2b$10$RvK3FZA2pmdvyf8kXthoBO86g.VMV0BP7ut9pGAqxJacsaOU1DYDC', 4);

-- Empresas
INSERT INTO empresa (id, nombre_comercial, ruc, telefono, estado) VALUES
    (1, 'TechStore Peru', '20600011122', '999888777', 'ACTIVO'),
    (2, 'Inka Electronics', '20456123456', '987654321', 'ACTIVO'),
    (3, 'Andes Computers', '20345789123', '965432187', 'ACTIVO'),
    (4, 'Pacific Tech', '20123456789', '944433322', 'ACTIVO');

-- Administradores de cada empresa
INSERT INTO usuario (id, empresa_id, nombre, dni, correo, contrasena, rol_id) VALUES
    (2, 1, 'Carlos Admin', '45678901', 'admin@techstore.pe',
     '$2b$10$RvK3FZA2pmdvyf8kXthoBO86g.VMV0BP7ut9pGAqxJacsaOU1DYDC', 1),
    (3, 2, 'María López', '56789012', 'admin@inkaelectronics.pe',
     '$2b$10$RvK3FZA2pmdvyf8kXthoBO86g.VMV0BP7ut9pGAqxJacsaOU1DYDC', 1),
    (4, 3, 'Juan Pérez', '67890123', 'admin@andescomputers.pe',
     '$2b$10$RvK3FZA2pmdvyf8kXthoBO86g.VMV0BP7ut9pGAqxJacsaOU1DYDC', 1),
    (5, 4, 'Lucía García', '78901234', 'admin@pacifictech.pe',
     '$2b$10$RvK3FZA2pmdvyf8kXthoBO86g.VMV0BP7ut9pGAqxJacsaOU1DYDC', 1);

-- Categorías (TechStore Peru = 1..3, Inka Electronics = 4..6, Andes Computers = 7..9, Pacific Tech = 10..12)
INSERT INTO categoria (id, empresa_id, nombre, descripcion) VALUES
    (1, 1, 'Laptops', 'Computadoras portátiles'),
    (2, 1, 'Smartphones', 'Teléfonos inteligentes'),
    (3, 1, 'Accesorios', 'Periféricos y complementos'),
    (4, 2, 'Laptops', 'Portátiles para trabajo y gaming'),
    (5, 2, 'Tablets', 'Dispositivos móviles de pantalla grande'),
    (6, 2, 'Audio', 'Auriculares y parlantes'),
    (7, 3, 'PC Escritorio', 'Computadoras de mesa'),
    (8, 3, 'Monitores', 'Pantallas y displays'),
    (9, 3, 'Componentes', 'Partes para PC'),
    (10, 4, 'Impresoras', 'Impresoras y multifuncionales'),
    (11, 4, 'Redes', 'Equipos de red y conectividad'),
    (12, 4, 'Software', 'Licencias y programas');

-- Productos (TechStore Peru)
INSERT INTO producto (id, empresa_id, categoria_id, nombre, precio_venta, stock_actual, stock_minimo) VALUES
    (1, 1, 1, 'MacBook Air M2', 4500.00, 10, 5),
    (2, 1, 1, 'MacBook Pro 14"', 7500.00, 5, 5),
    (3, 1, 1, 'Lenovo ThinkPad X1', 5200.00, 8, 5),
    (4, 1, 1, 'HP Spectre x360', 4800.00, 6, 5),
    (5, 1, 1, 'Dell XPS 13', 5100.00, 7, 5),
    (6, 1, 2, 'iPhone 14 Pro', 5200.00, 15, 5),
    (7, 1, 2, 'Samsung S23 Ultra', 4800.00, 12, 5),
    (8, 1, 2, 'Xiaomi 13 Pro', 3200.00, 20, 5),
    (9, 1, 2, 'Motorola Edge 40', 2500.00, 18, 5),
    (10, 1, 2, 'Google Pixel 7', 2900.00, 10, 5),
    (11, 1, 3, 'Mouse Logitech MX', 250.00, 50, 5),
    (12, 1, 3, 'Teclado mecánico RGB', 350.00, 30, 5),
    (13, 1, 3, 'Auriculares Sony', 600.00, 25, 5),
    (14, 1, 3, 'Cargador rápido', 120.00, 100, 5),
    (15, 1, 3, 'Funda para laptop', 80.00, 60, 5);

-- Productos (Inka Electronics)
INSERT INTO producto (id, empresa_id, categoria_id, nombre, precio_venta, stock_actual, stock_minimo) VALUES
    (16, 2, 4, 'Laptop Gamer ASUS ROG', 6500.00, 5, 5),
    (17, 2, 4, 'Laptop Dell Latitude', 4200.00, 10, 5),
    (18, 2, 4, 'Laptop HP Pavilion', 3800.00, 8, 5),
    (19, 2, 5, 'iPad Pro 12.9"', 5500.00, 7, 5),
    (20, 2, 5, 'Samsung Tab S9', 3500.00, 12, 5),
    (21, 2, 5, 'Lenovo Tab P12', 2200.00, 15, 5),
    (22, 2, 6, 'Audífonos Bose QC45', 1200.00, 20, 5),
    (23, 2, 6, 'Parlante JBL Charge 5', 800.00, 25, 5),
    (24, 2, 6, 'Microfono Blue Yeti', 900.00, 10, 5);

-- Productos (Andes Computers)
INSERT INTO producto (id, empresa_id, categoria_id, nombre, precio_venta, stock_actual, stock_minimo) VALUES
    (25, 3, 7, 'PC Gamer Intel i7', 5500.00, 3, 5),
    (26, 3, 7, 'PC Oficina AMD', 3200.00, 7, 5),
    (27, 3, 7, 'Workstation Dell', 8900.00, 2, 5),
    (28, 3, 8, 'Monitor Samsung 27"', 1200.00, 15, 5),
    (29, 3, 8, 'Monitor LG 24"', 850.00, 20, 5),
    (30, 3, 8, 'Monitor ASUS 32"', 2200.00, 5, 5),
    (31, 3, 9, 'Tarjeta gráfica RTX 4060', 2800.00, 4, 5),
    (32, 3, 9, 'SSD 1TB NVMe', 450.00, 30, 5),
    (33, 3, 9, 'Memoria RAM 16GB', 320.00, 40, 5);

-- Productos (Pacific Tech)
INSERT INTO producto (id, empresa_id, categoria_id, nombre, precio_venta, stock_actual, stock_minimo) VALUES
    (34, 4, 10, 'Impresora Epson L3250', 750.00, 12, 5),
    (35, 4, 10, 'Impresora HP LaserJet', 1200.00, 8, 5),
    (36, 4, 10, 'Impresora Brother DCP', 950.00, 10, 5),
    (37, 4, 11, 'Router TP-Link', 180.00, 25, 5),
    (38, 4, 11, 'Switch Cisco 24p', 3500.00, 3, 5),
    (39, 4, 11, 'Access Point Ubiquiti', 450.00, 15, 5),
    (40, 4, 12, 'Windows 11 Pro', 800.00, 20, 5),
    (41, 4, 12, 'Office 365', 350.00, 30, 5),
    (42, 4, 12, 'Antivirus Kaspersky', 120.00, 50, 5);

-- Proveedores
INSERT INTO proveedor (id, empresa_id, nombre, identificacion, telefono, correo) VALUES
    (1, 1, 'Apple Distribuidor', '20100100100', '111111111', 'ventas@apple-dist.pe'),
    (2, 1, 'Samsung Perú', '20200200200', '222222222', 'contacto@samsung.pe'),
    (3, 1, 'Lenovo Supply', '20300300300', '333333333', 'compras@lenovo.pe'),
    (4, 2, 'Dell Corp', '20400400400', '444444444', 'dell@inka.com'),
    (5, 2, 'HP Inc', '20500500500', '555555555', 'hp@inkaelectronics.pe'),
    (6, 3, 'Intel Peru', '20600600600', '666666666', 'intel@andes.pe'),
    (7, 3, 'AMD Latin', '20700700700', '777777777', 'amd@andes.pe'),
    (8, 4, 'Epson Perú', '20800800800', '888888888', 'epson@pacifictech.pe'),
    (9, 4, 'Microsoft', '20900900900', '999999999', 'ms@pacifictech.pe');
