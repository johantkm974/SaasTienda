package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.JwtService;
import com.example.demo.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    private boolean esSupremo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPREMO"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPREMO')")
    public Usuario crear(@RequestBody Usuario usuario,
                         @RequestHeader("Authorization") String token) {
        Integer empresaId;
        if (esSupremo()) {
            if (usuario.getEmpresa() == null || usuario.getEmpresa().getId() == null) {
                throw new RuntimeException("Debe indicar la empresa del usuario");
            }
            empresaId = usuario.getEmpresa().getId();
        } else {
            empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        }
        return usuarioService.crear(usuario, empresaId);
    }

    @GetMapping({"/", "/empresa", ""})
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPREMO')")
    public List<Usuario> listarPorEmpresa(@RequestHeader("Authorization") String token) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return usuarioService.listarPorEmpresa(empresaId);
    }

    // El SUPREMO puede ver los usuarios de cualquier empresa
    @GetMapping("/empresa/{empresaId}")
    @PreAuthorize("hasRole('SUPREMO')")
    public List<Usuario> listarPorEmpresaId(@PathVariable Integer empresaId) {
        return usuarioService.listarPorEmpresa(empresaId);
    }

    // Solo el SUPREMO puede ver TODOS los usuarios de TODAS las empresas
    @GetMapping("/todos")
    @PreAuthorize("hasRole('SUPREMO')")
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPREMO')")
    public Usuario actualizar(@PathVariable Integer id,
                              @RequestBody Usuario usuario,
                              @RequestHeader("Authorization") String token) {
        Integer empresaId;
        if (esSupremo()) {
            empresaId = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                    .getEmpresa().getId();
        } else {
            empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        }
        return usuarioService.actualizar(id, usuario, empresaId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPREMO')")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {
        Integer empresaId;
        if (esSupremo()) {
            empresaId = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                    .getEmpresa().getId();
        } else {
            empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        }
        usuarioService.eliminar(id, empresaId);
    }
}
