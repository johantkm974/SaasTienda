-- V6: Réplica SV Electrónicos — autenticación de clientes (tabla aparte), codigo_sku y contenido de tienda

-- ClienteAutenticacion: login propio del cliente de la tienda (NO usuario del sistema)
CREATE TABLE cliente_autenticacion (
    id_auth_cliente INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL UNIQUE,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    ultimo_acceso DATETIME NULL,
    CONSTRAINT fk_cliente_auth_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- Producto: código SKU para el catálogo de la tienda
ALTER TABLE producto ADD COLUMN codigo_sku VARCHAR(50) NULL;

-- Seed de banners y contenido de página para la tienda activa por defecto (empresa 1)
INSERT INTO banner (empresa_id, titulo, subtitulo, descripcion, imagen_url, enlace, orden, pagina, activo) VALUES
(1, 'Ofertas de temporada', 'Descuentos exclusivos', NULL, 'https://res.cloudinary.com/dsyfifre1/image/upload/v1782693360/sistema_ventas/p90ybzqomvjgb', NULL, 1, 'home', TRUE),
(1, 'Nuevo', 'Descubre los ultimos productos en nuestro catalogo', NULL, 'https://res.cloudinary.com/dsyfifre1/image/upload/v1782693546/sistema_ventas/zbct7xaie5jow', NULL, 2, 'home', TRUE),
(1, 'Envio gratis', 'En compras mayores a S/. 500', NULL, 'https://res.cloudinary.com/dsyfifre1/image/upload/v1782697740/sistema_ventas/dgcljhohkevhz', NULL, 3, 'home', TRUE),
(1, 'Compra online', 'Elige entre miles de productos', NULL, 'https://res.cloudinary.com/dsyfifre1/image/upload/v1782693486/sistema_ventas/gpmntzgitqnwr', NULL, 1, 'tienda', TRUE);

INSERT INTO contenido_pagina (empresa_id, vista, clave, valor_texto, imagen_url, activo) VALUES
(1, 'home', 'titulo_principal', 'Bienvenido a SV Electronicos', NULL, TRUE),
(1, 'home', 'subtitulo_principal', 'Tu tienda de confianza para componentes electronicos', NULL, TRUE),
(1, 'home', 'texto_boton_catalogo', 'Ver catalogo', NULL, TRUE),
(1, 'home', 'seccion_destacados_titulo', 'Productos Destacados', NULL, TRUE),
(1, 'home', 'seccion_destacados_subtitulo', 'Los componentes mas populares de nuestro catalogo', NULL, TRUE),
(1, 'home', 'seccion_razones_titulo', 'Por que elegirnos?', NULL, TRUE),
(1, 'home', 'seccion_razones_subtitulo', 'Somos tu mejor opcion en componentes electronicos', NULL, TRUE),
(1, 'tienda', 'titulo_principal', 'Componentes listos para tu siguiente equipo', NULL, TRUE),
(1, 'tienda', 'subtitulo_principal', 'Catalogo activo, carrito mejorado con persistencia y checkout conectado al backend de ventas.', NULL, TRUE),
(1, 'tienda', 'eyebrow', 'Compra online', NULL, TRUE),
(1, 'tienda', 'texto_boton', 'VER CATALOGO', NULL, TRUE),
(1, 'productos', 'titulo', 'Nuestros Productos', NULL, TRUE),
(1, 'productos', 'subtitulo', 'Explora todo nuestro catalogo de componentes', NULL, TRUE),
(1, 'productos', 'texto_boton_comprar', 'Comprar', NULL, TRUE),
(1, 'nosotros', 'titulo', 'Sobre Nosotros', NULL, TRUE),
(1, 'nosotros', 'subtitulo', 'Somos una empresa peruana dedicada a la venta de componentes electronicos.', NULL, TRUE),
(1, 'nosotros', 'seccion_historia_titulo', 'Nuestra Historia', NULL, TRUE),
(1, 'nosotros', 'mision', 'Ofrecer los mejores componentes electronicos con garantia y soporte.', NULL, TRUE),
(1, 'nosotros', 'vision', 'Ser la tienda de referencia en tecnologia en Peru.', NULL, TRUE),
(1, 'nosotros', 'valores_titulo', 'Valores', NULL, TRUE),
(1, 'nosotros', 'valores_texto', 'Integridad, excelencia, innovacion y compromiso con nuestros clientes.', NULL, TRUE),
(1, 'contactanos', 'titulo', 'Contactanos', NULL, TRUE),
(1, 'contactanos', 'subtitulo', 'Estamos aqui para ayudarte', NULL, TRUE),
(1, 'contactanos', 'telefono', '+51 999 888 777', NULL, TRUE),
(1, 'contactanos', 'correo', 'ventas@svelectronicos.com', NULL, TRUE),
(1, 'contactanos', 'direccion', 'Av. Tecnologica 1234, San Isidro', NULL, TRUE),
(1, 'contactanos', 'whatsapp', '51999888777', NULL, TRUE),
(1, 'contactanos', 'whatsapp_mensaje', 'Hola, quiero informacion de un producto', NULL, TRUE),
(1, 'contactanos', 'facebook', 'https://facebook.com/svelectronicos', NULL, TRUE),
(1, 'contactanos', 'tiktok', 'https://tiktok.com/@svelectronicos', NULL, TRUE),
(1, 'contactanos', 'instagram', 'https://instagram.com/svelectronicos', NULL, TRUE),
(1, 'footer', 'marca_texto', 'Tu tienda de confianza para componentes electronicos. Ofrecemos los mejores productos con garantia y soporte.', NULL, TRUE),
(1, 'footer', 'telefono', '+51 999 888 777', NULL, TRUE),
(1, 'footer', 'correo', 'ventas@svelectronicos.com', NULL, TRUE),
(1, 'footer', 'direccion', 'Lima, Peru', NULL, TRUE),
(1, 'footer', 'facebook', 'https://facebook.com/svelectronicos', NULL, TRUE),
(1, 'footer', 'tiktok', 'https://tiktok.com/@svelectronicos', NULL, TRUE),
(1, 'footer', 'instagram', 'https://instagram.com/svelectronicos', NULL, TRUE),
(1, 'login', 'titulo', 'Iniciar Sesion', NULL, TRUE),
(1, 'login', 'subtitulo', 'Accede a tu cuenta para realizar compras', NULL, TRUE),
(1, 'login', 'texto_boton', 'Iniciar sesion', NULL, TRUE);
