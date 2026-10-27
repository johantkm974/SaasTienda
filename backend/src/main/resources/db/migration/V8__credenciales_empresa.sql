-- Credenciales de integración por empresa (cifradas, gestionables desde el panel)
-- proveedor: MERCADO_PAGO | PAYPAL | CLOUDINARY | EMAIL
CREATE TABLE credencial_empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    proveedor VARCHAR(30) NOT NULL,
    dato_cifrado TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_empresa_proveedor (empresa_id, proveedor),
    CONSTRAINT fk_credencial_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
