package com.example.demo.controller;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Registro 
    @PostMapping("/register")
    public String registrar(@RequestBody AuthRequest request, @RequestParam Integer empresaId) {
        return authService.registrar(request, empresaId);
    }

    // 2. Login 
    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        String token = authService.login(request.getCorreo(), request.getContrasena());
        return AuthResponse.builder()
                .token(token)
                .rol("ADMIN") 
                .build();
    }
}



