package com.example.demo.controller;

import com.example.demo.dto.LoginDTO;
import com.example.demo.dto.RegistroEmpresaDTO;
import com.example.demo.model.Usuario;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST http://localhost:8080/auth/registro
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroEmpresaDTO dto) {
        try {
            Usuario nuevoUsuario = authService.registrarEmpresa(dto);
            return ResponseEntity.ok("Empresa registrada con éxito. ID: " + nuevoUsuario.getEmpresa().getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // POST http://localhost:8080/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
        try {
            Usuario usuario = authService.login(dto);
            
            // Devolvemos un JSON simple con los datos clave
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Login exitoso");
            respuesta.put("usuarioId", usuario.getId());
            respuesta.put("nombre", usuario.getNombre());
            respuesta.put("empresaId", usuario.getEmpresa().getId()); // DATO IMPORTANTE PARA EL FRONTEND
            respuesta.put("rol", usuario.getRol().getNombre());
            
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Error: " + e.getMessage());
        }
    }
}
