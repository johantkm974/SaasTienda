-- ===================================================================
-- V12: Verificación de correo antes de vincular una cuenta.
--
-- Si alguien se registra con un correo que ya existe como cliente invitado
-- (creado en el checkout, sin contraseña), el sistema NO vincula la cuenta
-- todavía: pide un código de 6 dígitos enviado a ese correo. Así se demuestra
-- la propiedad del correo y evita que un tercero se apodere del historial de
-- compras, el teléfono y la dirección de otra persona.
--
-- Los datos del registro quedan aquí de forma temporal y se consumen al
-- verificar el código (o caducan a los 15 minutos / a los 5 intentos).
-- ===================================================================

CREATE TABLE verificacion_registro (
    id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    empresa_id    INT          NOT NULL,
    correo        VARCHAR(150) NOT NULL,
    nombres       VARCHAR(150) NULL,
    apellidos     VARCHAR(150) NULL,
    telefono      VARCHAR(30)  NULL,
    direccion     VARCHAR(255) NULL,
    password_hash VARCHAR(255) NOT NULL,
    codigo_hash   VARCHAR(255) NOT NULL,
    intentos      INT          NOT NULL DEFAULT 0,
    expira_en     DATETIME     NOT NULL,
    creado_en     DATETIME     NOT NULL,
    UNIQUE KEY uk_verificacion_registro (empresa_id, correo),
    CONSTRAINT fk_verificacion_registro_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresa (id)
);
