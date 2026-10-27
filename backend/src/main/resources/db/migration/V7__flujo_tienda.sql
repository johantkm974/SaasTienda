-- V7: Flujo de compra de tienda unificado y seguro

-- Costo de envío configurable por empresa (calculado y sellado en el backend,
-- nunca lo define el cliente en el checkout)
ALTER TABLE empresa ADD COLUMN costo_envio DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE empresa ADD COLUMN envio_gratis_desde DECIMAL(10, 2) NULL;

-- Marca si el stock fue reservado al crear la orden (evita doble descuento
-- al confirmarse el pago y permite reponerlo si la orden se rechaza/cancela)
ALTER TABLE venta ADD COLUMN stock_reservado BOOLEAN NOT NULL DEFAULT FALSE;
