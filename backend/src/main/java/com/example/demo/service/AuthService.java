package com.example.demo.service;

import com.example.demo.model.Usuario;
import com.example.demo.model.Empresa;
import com.example.demo.model.Rol;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.RolRepository;
import com.example.demo.dto.AuthRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final RolRepository rolRepository;
    private final JwtService jwtService;

   
  
public String registrar(AuthRequest request, Integer empresaId) {
    
    Empresa empresa = empresaRepository.findById(empresaId)
            .orElseThrow(() -> new RuntimeException("La empresa no existe"));

    //  rol por defecto (ejemplo: ID 1 para Administrador)
    Rol rolDefault = rolRepository.findById(1) 
            .orElseThrow(() -> new RuntimeException("Rol por defecto no configurado"));

    Usuario nuevoUsuario = new Usuario();
    nuevoUsuario.setCorreo(request.getCorreo());
    nuevoUsuario.setContrasena(request.getContrasena());
    nuevoUsuario.setEmpresa(empresa);
    nuevoUsuario.setRol(rolDefault); 

    usuarioRepository.save(nuevoUsuario);
    
    return "Usuario registrado en la bodega: " + empresa.getNombreComercial();
    }

    public String login(String correo, String contrasena) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!usuario.getContrasena().equals(contrasena)) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return jwtService.generateToken(usuario);
    }
}

