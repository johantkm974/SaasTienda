package com.example.demo.service;

import com.example.demo.model.Empresa;
import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Rol;
import com.example.demo.model.Usuario;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.RolRepository;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;
    private final RolRepository rolRepository;

    private boolean esSupremo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPREMO"));
    }

    /**
     * Impide la escalada de privilegios: solo un usuario SUPREMO puede asignar
     * el rol SUPREMO. El rol se resuelve desde la BD, por lo que no se confia
     * en el id o el nombre enviados por el cliente.
     */
    private void validarRolAsignable(Rol rolNuevo) {
        if (rolNuevo == null || rolNuevo.getId() == null) {
            return;
        }
        Rol rolReal = rolRepository.findById(rolNuevo.getId())
                .orElseThrow(() -> new NotFoundException("Rol no encontrado"));
        if ("SUPREMO".equals(rolReal.getNombre()) && !esSupremo()) {
            throw new AccessDeniedException("No tiene permisos para asignar el rol SUPREMO");
        }
    }

    public Usuario crear(Usuario usuario, Integer empresaId) {

        usuario.setId(null);
        if (usuario.getIntentosFallidos() == null) {
            usuario.setIntentosFallidos(0);
        }

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));

        usuario.setEmpresa(empresa);

        usuarioRepository
                .findByCorreoAndEmpresaId(usuario.getCorreo(), empresaId)
                .ifPresent(u -> {
                    throw new RuntimeException("Correo ya registrado en esta empresa");
                });

        if (usuario.getContrasena() == null || usuario.getContrasena().isEmpty()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

        validarRolAsignable(usuario.getRol());

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Integer id, Usuario usuarioActualizado, Integer empresaId) {

        return usuarioRepository.findByIdAndEmpresaId(id, empresaId)
                .map(usuarioExistente -> {

                    if (usuarioActualizado.getNombre() != null) {
                        usuarioExistente.setNombre(usuarioActualizado.getNombre());
                    }
                    if (usuarioActualizado.getDni() != null) {
                        usuarioExistente.setDni(usuarioActualizado.getDni());
                    }
                    if (usuarioActualizado.getCorreo() != null) {
                        usuarioRepository
                                .findByCorreoAndEmpresaId(usuarioActualizado.getCorreo(), empresaId)
                                .filter(u -> !u.getId().equals(id))
                                .ifPresent(u -> {
                                    throw new RuntimeException("Correo ya registrado en esta empresa");
                                });
                        usuarioExistente.setCorreo(usuarioActualizado.getCorreo());
                    }
                    if (usuarioActualizado.getContrasena() != null && !usuarioActualizado.getContrasena().isEmpty()) {
                        usuarioExistente.setContrasena(passwordEncoder.encode(usuarioActualizado.getContrasena()));
                    }
                    if (usuarioActualizado.getRol() != null && usuarioActualizado.getRol().getId() != null) {
                        validarRolAsignable(usuarioActualizado.getRol());
                        usuarioExistente.setRol(usuarioActualizado.getRol());
                    }

                    return usuarioRepository.save(usuarioExistente);
                })
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado en su empresa"));
    }

    public List<Usuario> listarPorEmpresa(Integer empresaId) {
        return usuarioRepository.findByEmpresaId(empresaId);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public void eliminar(Integer id, Integer empresaId) {

        Usuario usuario = usuarioRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado en su empresa"));

        usuarioRepository.delete(usuario);
    }
}
