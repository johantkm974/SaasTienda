// d:\Proyectos de GitHub\SaasTienda\backend\src\main\java\com\example\demo\service\AuthService.java
package com.example.demo.service;

import com.example.demo.dto.LoginDTO;
import com.example.demo.dto.RegistroEmpresaDTO;
import com.example.demo.model.Empresa;
import com.example.demo.model.Rol;
import com.example.demo.model.Usuario;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.RolRepository;
import com.example.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @Transactional
    public Usuario registrarEmpresa(RegistroEmpresaDTO dto) {
        // 1. Crear la Empresa
        Empresa empresa = new Empresa();
        empresa.setNombreComercial(dto.getNombreEmpresa());
        empresa.setRuc(dto.getRuc());
        empresa.setTelefono(dto.getTelefono());
        // empresa.setEstado("ACTIVO");
        
        empresa = empresaRepository.save(empresa);

        // 2. Asignar Rol Admin (Asumimos que ID 1 es Admin según tu SQL)
        Rol rolAdmin = rolRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Error: Rol Administrador no existe en BD. Ejecuta el script de datos."));

        // 3. Crear el Usuario Admin
        Usuario usuario = new Usuario();
        usuario.setEmpresa(empresa);
        usuario.setNombre(dto.getNombreUsuario());
        usuario.setCorreo(dto.getCorreo());
        usuario.setDni(dto.getDni());
        usuario.setRol(rolAdmin);
        usuario.setContrasena(dto.getPassword()); // Guardamos contraseña tal cual (SIN ENCRIPTAR)

        return usuarioRepository.save(usuario);
    }

    public Usuario login(LoginDTO dto) {
        // 1. Buscar usuario
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(dto.getCorreo());
        
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();

        // 2. Comparación simple de texto (NO ROBUSTA, SOLO PRUEBAS)
        if (!usuario.getContrasena().equals(dto.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return usuario;
    }
}
