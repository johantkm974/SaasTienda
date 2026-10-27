-- V4: Tienda pública — branding por empresa, productos destacados, visibilidad de categorías
ALTER TABLE empresa ADD COLUMN slogan VARCHAR(255) NULL;
ALTER TABLE empresa ADD COLUMN color_primario VARCHAR(20) NOT NULL DEFAULT '#10b981';
ALTER TABLE empresa ADD COLUMN banner_url TEXT NULL;
ALTER TABLE empresa ADD COLUMN mostrar_stock BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE producto ADD COLUMN destacado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE categoria ADD COLUMN visible_tienda BOOLEAN NOT NULL DEFAULT TRUE;
