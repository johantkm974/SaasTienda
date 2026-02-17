// Ubicación sugerida: src/main/java/com/example/demo/dto/RegistroEmpresaDTO.java
package com.example.demo.dto;

import lombok.Data;

@Data
public class RegistroEmpresaDTO {
    // Datos de la Empresa
    private String nombreEmpresa;
    private String ruc;
    private String telefono;
    // private boolean estado;
    
    // Datos del Usuario Admin
    private String nombreUsuario;
    private String correo;
    private String password;
    private String dni;
}
