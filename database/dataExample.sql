-- A) Crear Roles
INSERT INTO rol (nombre, descripcion) VALUES 
('Administrador', 'Acceso total a su empresa'),
('Vendedor', 'Puede registrar ventas'),
('Cliente', 'Compra en la tienda');

-- B) Crear Empresa "TechStore"
INSERT INTO empresa (ruc, nombre_comercial, telefono) VALUES 
( '12345678912','TechStore Peru',  '999888777');

-- C) Crear Usuario Admin para TechStore
INSERT INTO usuario (empresa_id, nombre, correo, contrasena, rol_id, dni) VALUES 
(1, 'Carlos Admin', 'admin@techstore.pe', 'secret123', 1, 12345678);

-- D) Crear Categoría y Producto
INSERT INTO categoria (empresa_id, nombre) VALUES (1, 'Laptops');
INSERT INTO producto (empresa_id, categoria_id, nombre, precio_venta, stock_actual) VALUES 
(1, 1, 'MacBook Air M2', 4500.00, 0); -- Inicia con Stock 0

-- E) Crear Proveedor
INSERT INTO proveedor (empresa_id, nombre, identificacion) VALUES 
(1, 'Apple Distribuidor', '20100100100');

-- F) FLUJO DE COMPRA (Entrada de Stock)
-- Registramos la compra
INSERT INTO compra (empresa_id, proveedor_id, total_compra, numero_comprobante) VALUES 
(1, 1, 40000.00, 'FAC-001');
-- Registramos el detalle (10 Laptops a 4000 c/u)
INSERT INTO detalle_compra (compra_id, producto_id, cantidad, costo_unitario) VALUES 
(1, 1, 10, 4000.00);
-- ACTUALIZAMOS STOCK (Manual o por código backend)
UPDATE producto SET stock_actual = stock_actual + 10 WHERE id = 1;

-- G) FLUJO DE VENTA (Salida de Stock)
-- Registramos la venta
INSERT INTO venta (empresa_id, usuario_id, total_venta, metodo_pago, estado_pago) VALUES 
(1, NULL, 4500.00, 'Yape', 'PAGADO'); -- Usuario NULL = Cliente anónimo
-- Registramos el detalle (1 Laptop a 4500)
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES 
(1, 1, 1, 4500.00, 4500.00);
-- ACTUALIZAMOS STOCK
UPDATE producto SET stock_actual = stock_actual - 1 WHERE id = 1;