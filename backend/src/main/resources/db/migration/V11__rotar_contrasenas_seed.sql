-- ===================================================================
-- V11: Rota las contraseñas de los usuarios semilla.
--
-- V2 creó el superadmin y los 4 administradores de empresa con la MISMA
-- contraseña (12345678) y la documentó en el propio archivo. Como Flyway
-- migra en todos los perfiles, esas cuentas existian tambien en
-- produccion con una credencial de conocimiento publico.
--
-- Se sustituye por una contraseña fuerte que NO figura en el
-- repositorio: se entrega fuera del repo (canal privado / gestor de
-- contraseñas).
--
-- V2 no se modifica porque Flyway valida su checksum una vez aplicada;
-- por eso el cambio va en una migracion nueva.
--
-- Solo se tocan las 5 cuentas del seed (se identifican por correo, no
-- por id, para que valga igual en una BD nueva). Los usuarios creados
-- despues por la aplicacion conservan su contraseña.
-- ===================================================================

UPDATE usuario
SET contrasena = '$2b$10$3qBWiRa/ipD9siYejourjuL2h1pFGlbWtweeVX1.OGcINciu4fSza'
WHERE correo IN (
    'supremo@saas.local',
    'admin@techstore.pe',
    'admin@inkaelectronics.pe',
    'admin@andescomputers.pe',
    'admin@pacifictech.pe'
);
