package com.example.demo.service;

import com.example.demo.model.Empresa;
import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Usuario;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;

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
