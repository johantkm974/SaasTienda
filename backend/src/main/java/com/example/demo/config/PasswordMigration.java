package com.example.demo.config;

import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Migra contraseñas en texto plano a BCrypt al arrancar
 * (por si la base de datos proviene de un seed antiguo).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordMigration implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<Usuario> usuarios = usuarioRepository.findAll();

        int migrados = 0;
        for (Usuario u : usuarios) {
            String password = u.getContrasena();
            if (password != null && !password.startsWith("$2")) {
                u.setContrasena(passwordEncoder.encode(password));
                usuarioRepository.save(u);
                migrados++;
                log.warn("Contraseña migrada a BCrypt para: {}", u.getCorreo());
            }
        }

        if (migrados > 0) {
            log.info("PasswordMigration: {} contraseñas convertidas a BCrypt", migrados);
        }
    }
}
