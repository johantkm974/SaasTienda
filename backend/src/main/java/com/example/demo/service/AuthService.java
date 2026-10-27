package com.example.demo.service;

import com.example.demo.exception.CuentaBloqueadaException;
import com.example.demo.model.Usuario;
import com.example.demo.model.Empresa;
import com.example.demo.model.EstadoEmpresa;
import com.example.demo.model.Rol;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.RolRepository;
import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final RolRepository rolRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final BloqueoCuentaService bloqueoCuentaService;

    @Transactional
    public AuthResponse registrar(RegisterRequest request) {

        empresaRepository.findByRuc(request.getRuc())
                .ifPresent(e -> {
                    throw new RuntimeException("Ya existe una empresa con ese RUC");
                });

        usuarioRepository.findByCorreo(request.getCorreo())
                .ifPresent(u -> {
                    throw new RuntimeException("Ya existe una cuenta con ese correo");
                });

        Empresa empresa = new Empresa();
        empresa.setNombreComercial(request.getNombreEmpresa());
        empresa.setRuc(request.getRuc());
        empresa.setTelefono(request.getTelefono());
        empresa.setEstado(EstadoEmpresa.ACTIVO);
        empresa = empresaRepository.save(empresa);

        Rol rolAdmin = rolRepository.findByNombre("Administrador")
                .orElseGet(() -> rolRepository.findById(1)
                        .orElseThrow(() -> new RuntimeException("Rol Administrador no configurado")));

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombreUsuario());
        nuevoUsuario.setDni(request.getDni());
        nuevoUsuario.setCorreo(request.getCorreo());
        nuevoUsuario.setContrasena(passwordEncoder.encode(request.getPassword()));
        nuevoUsuario.setEmpresa(empresa);
        nuevoUsuario.setRol(rolAdmin);

        usuarioRepository.save(nuevoUsuario);

        String token = jwtService.generateToken(nuevoUsuario);

        return AuthResponse.builder()
                .token(token)
                .rol(rolAdmin.getNombre())
                .build();
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (estaBloqueado(usuario)) {
            throw new CuentaBloqueadaException(
                    "Cuenta bloqueada temporalmente por intentos fallidos. Intente en " + minutosRestantes(usuario) + " minuto(s).");
        }

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
            bloqueoCuentaService.registrarIntentoFallido(usuario);
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (usuario.getEmpresa() != null
                && usuario.getEmpresa().getEstado() == EstadoEmpresa.SUSPENDIDO) {
            throw new RuntimeException("La empresa se encuentra suspendida");
        }

        desbloquear(usuario);

        String token = jwtService.generateToken(usuario);
        String rol = usuario.getRol() != null ? usuario.getRol().getNombre() : "VENDEDOR";

        return AuthResponse.builder()
                .token(token)
                .rol(rol)
                .build();
    }

    private boolean estaBloqueado(Usuario usuario) {
        return usuario.getBloqueadoHasta() != null && usuario.getBloqueadoHasta().isAfter(LocalDateTime.now());
    }

    private long minutosRestantes(Usuario usuario) {
        long minutos = java.time.Duration.between(LocalDateTime.now(), usuario.getBloqueadoHasta()).toMinutes();
        return Math.max(1, minutos);
    }

    private void desbloquear(Usuario usuario) {
        if (usuario.getIntentosFallidos() != null && usuario.getIntentosFallidos() > 0) {
            usuario.setIntentosFallidos(0);
        }
        if (usuario.getBloqueadoHasta() != null) {
            usuario.setBloqueadoHasta(null);
        }
    }
}
