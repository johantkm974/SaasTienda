-- V3: Superadmin — soft delete para empresas
ALTER TABLE empresa ADD COLUMN eliminado BOOLEAN NOT NULL DEFAULT FALSE;
