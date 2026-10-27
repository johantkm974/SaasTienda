-- Contra entrega configurable por empresa
ALTER TABLE empresa
    ADD COLUMN contra_entrega TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN contra_entrega_maximo DECIMAL(10,2) NULL;
