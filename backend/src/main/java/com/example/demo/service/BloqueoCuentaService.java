package com.example.demo.service;

import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Registra intentos fallidos de login en su propia transacción para que
 * persistan aunque el login falle (y revierta su transacción).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BloqueoCuentaService {

    public static final int MAX_INTENTOS_FALLIDOS = 5;
    public static final int MINUTOS_BLOQUEO = 15;

    private final UsuarioRepository usuarioRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarIntentoFallido(Usuario usuario) {
        Usuario u = usuarioRepository.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        int intentos = (u.getIntentosFallidos() == null ? 0 : u.getIntentosFallidos()) + 1;
        if (intentos >= MAX_INTENTOS_FALLIDOS) {
            u.setBloqueadoHasta(LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEO));
            u.setIntentosFallidos(0);
            log.warn("Cuenta bloqueada {} min por intentos fallidos: {}", MINUTOS_BLOQUEO, u.getCorreo());
        } else {
            u.setIntentosFallidos(intentos);
            log.debug("Intento fallido {}/{} para {}", intentos, MAX_INTENTOS_FALLIDOS, u.getCorreo());
        }
        usuarioRepository.save(u);
    }
}
