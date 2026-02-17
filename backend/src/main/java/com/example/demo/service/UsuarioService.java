package com.example.demo.service;

import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public Usuario crear(Usuario usuario) {

        usuarioRepository
                .findByCorreoAndEmpresaId(usuario.getCorreo(), usuario.getEmpresa().getId())
                .ifPresent(u -> {
                    throw new RuntimeException("Correo ya registrado en esta empresa");
                });

        return usuarioRepository.save(usuario);
    }
    public Usuario actualizar(Integer id,Usuario usuarioActualizado){
        return usuarioRepository.findById(id).map(usuarioExistente ->{
                usuarioExistente.setNombre(usuarioActualizado.getNombre());
                usuarioExistente.setDni(usuarioActualizado.getDni());
                usuarioExistente.setCorreo(usuarioActualizado.getCorreo());
                usuarioExistente.setContrasena(usuarioActualizado.getContrasena());

                usuarioExistente.setEmpresa(usuarioActualizado.getEmpresa());
                usuarioExistente.setRol(usuarioActualizado.getRol());

                return usuarioRepository.save(usuarioExistente);

        })
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el ID: " + id));
    }
    public List<Usuario>listarTodos(){
        return usuarioRepository.findAll();
    }

    public List<Usuario> listarPorEmpresa(Integer empresaId) {
        return usuarioRepository.findByEmpresaId(empresaId);
    }

    public void eliminar(Integer id) {
        usuarioRepository.deleteById(id);
    }
}


