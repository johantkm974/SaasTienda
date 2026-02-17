package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.Usuario;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // Ruta pública configurada en SecurityConfig
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registro")
    public AuthResponse registro(@RequestBody Usuario usuario) {
        return authService.registro(usuario);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }
}