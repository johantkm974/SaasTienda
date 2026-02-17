package com.example.demo.controller;

import com.example.demo.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {

        String token = authService.login(
                request.getCorreo(),
                request.getContrasena()
        );

        return Map.of("token", token);
    }
}

@Data
class LoginRequest {
    private String correo;
    private String contrasena;
}

