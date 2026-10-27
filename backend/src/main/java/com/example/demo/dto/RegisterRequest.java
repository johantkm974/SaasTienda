package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "El nombre de la empresa es obligatorio")
    private String nombreEmpresa;

    @NotBlank(message = "El RUC es obligatorio")
    @Size(min = 8, max = 11, message = "El RUC debe tener entre 8 y 11 dígitos")
    private String ruc;

    private String telefono;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo inválido")
    private String correo;

    @NotBlank(message = "El nombre del usuario es obligatorio")
    private String nombreUsuario;

    @NotBlank(message = "El DNI es obligatorio")
    private String dni;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;
}
