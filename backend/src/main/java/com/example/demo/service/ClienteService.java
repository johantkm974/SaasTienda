package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Cliente;
import com.example.demo.model.ClienteAutenticacion;
import com.example.demo.model.Empresa;
import com.example.demo.model.EstadoEmpresa;
import com.example.demo.repository.ClienteAutenticacionRepository;
import com.example.demo.repository.ClienteRepository;
import com.example.demo.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClienteAutenticacionRepository clienteAutenticacionRepository;
    private final JwtService jwtService;

    public Cliente registrar(Integer empresaId, Cliente cliente) {
        cliente.setId(null);

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("La tienda no existe"));

        if (empresa.getEstado() != EstadoEmpresa.ACTIVO) {
            throw new RuntimeException("La tienda está suspendida");
        }

        if (cliente.getCorreo() == null || cliente.getCorreo().isBlank()) {
            throw new RuntimeException("El correo es obligatorio");
        }

        clienteRepository.findByCorreoAndEmpresaId(cliente.getCorreo(), empresaId)
                .ifPresent(c -> {
                    throw new RuntimeException("Ya existe un cliente con ese correo en esta tienda");
                });

        if (cliente.getPasswordHash() != null && !cliente.getPasswordHash().isBlank()) {
            cliente.setPasswordHash(passwordEncoder.encode(cliente.getPasswordHash()));
        }

        cliente.setEmpresa(empresa);
        cliente.setEstado("ACTIVO");
        return clienteRepository.save(cliente);
    }

    public Cliente registrarDesdeTienda(Integer empresaId, String nombres, String apellidos,
                                        String correo, String telefono, String direccion) {
        Cliente cliente = new Cliente();
        cliente.setNombres(nombres);
        cliente.setApellidos(apellidos);
        cliente.setCorreo(correo);
        cliente.setTelefono(telefono);
        cliente.setDireccion(direccion);
        return registrar(empresaId, cliente);
    }

    public List<Cliente> listarPorEmpresa(Integer empresaId) {
        return clienteRepository.findByEmpresaId(empresaId);
    }

    public Cliente buscarPorId(Integer id, Integer empresaId) {
        return clienteRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado en su tienda"));
    }

    public Cliente buscarPorCorreo(String correo, Integer empresaId) {
        return clienteRepository.findByCorreoAndEmpresaId(correo, empresaId)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));
    }

    public Cliente actualizar(Integer id, Integer empresaId, Cliente actualizado) {
        return clienteRepository.findByIdAndEmpresaId(id, empresaId)
                .map(existente -> {
                    if (actualizado.getNombres() != null) {
                        existente.setNombres(actualizado.getNombres());
                    }
                    if (actualizado.getApellidos() != null) {
                        existente.setApellidos(actualizado.getApellidos());
                    }
                    if (actualizado.getTelefono() != null) {
                        existente.setTelefono(actualizado.getTelefono());
                    }
                    if (actualizado.getDireccion() != null) {
                        existente.setDireccion(actualizado.getDireccion());
                    }
                    if (actualizado.getEstado() != null) {
                        existente.setEstado(actualizado.getEstado());
                    }
                    if (actualizado.getCorreo() != null && !actualizado.getCorreo().equals(existente.getCorreo())) {
                        clienteRepository.findByCorreoAndEmpresaId(actualizado.getCorreo(), empresaId)
                                .filter(c -> !c.getId().equals(id))
                                .ifPresent(c -> {
                                    throw new RuntimeException("Ya existe un cliente con ese correo");
                                });
                        existente.setCorreo(actualizado.getCorreo());
                    }
                    return clienteRepository.save(existente);
                })
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado en su tienda"));
    }

    public void eliminar(Integer id, Integer empresaId) {
        Cliente cliente = buscarPorId(id, empresaId);
        cliente.setEstado("INACTIVO");
        clienteRepository.save(cliente);
    }

    /**
     * Registro híbrido desde la tienda pública: crea (o recupera) el Cliente por correo
     * y le asocia una cuenta con contraseña. Devuelve la sesión (token JWT de cliente).
     */
    public Map<String, Object> registrarConCuenta(Integer empresaId, String nombres, String apellidos,
                                                  String correo, String telefono, String direccion,
                                                  String contrasena) {
        if (contrasena == null || contrasena.isBlank()) {
            throw new RuntimeException("La contrasena es obligatoria");
        }
        if (clienteAutenticacionRepository.findByCorreo(correo).isPresent()) {
            throw new RuntimeException("El correo ya tiene una cuenta registrada");
        }

        Cliente cliente = clienteRepository.findByCorreoAndEmpresaId(correo, empresaId)
                .orElseGet(() -> registrar(empresaId, construirCliente(
                        nombres, apellidos, correo, telefono, direccion)));

        ClienteAutenticacion autenticacion = new ClienteAutenticacion();
        autenticacion.setCliente(cliente);
        autenticacion.setCorreo(correo);
        autenticacion.setPasswordHash(passwordEncoder.encode(contrasena));
        autenticacion.setUltimoAcceso(LocalDateTime.now());
        clienteAutenticacionRepository.save(autenticacion);

        return sesion(cliente, correo);
    }

    /** Login de cliente con contraseña en una tienda específica. Devuelve la sesión con token. */
    public Map<String, Object> login(Integer empresaId, String correo, String contrasena) {
        if (correo == null || contrasena == null) {
            throw new RuntimeException("Credenciales invalidas");
        }
        ClienteAutenticacion autenticacion = clienteAutenticacionRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Credenciales invalidas"));
        if (!passwordEncoder.matches(contrasena, autenticacion.getPasswordHash())) {
            throw new RuntimeException("Credenciales invalidas");
        }
        Cliente cliente = clienteRepository.findByCorreoAndEmpresaId(correo, empresaId)
                .orElseThrow(() -> new RuntimeException("No hay una cuenta de cliente en esta tienda"));
        autenticacion.setUltimoAcceso(LocalDateTime.now());
        clienteAutenticacionRepository.save(autenticacion);
        return sesion(cliente, correo);
    }

    private Cliente construirCliente(String nombres, String apellidos, String correo,
                                     String telefono, String direccion) {
        Cliente cliente = new Cliente();
        cliente.setNombres(nombres);
        cliente.setApellidos(apellidos);
        cliente.setCorreo(correo);
        cliente.setTelefono(telefono);
        cliente.setDireccion(direccion);
        return cliente;
    }

    private Map<String, Object> sesion(Cliente cliente, String correo) {
        return Map.of(
                "token", jwtService.generateToken(correo, "CLIENTE"),
                "refreshToken", jwtService.generateRefreshToken(correo, "CLIENTE"),
                "tipo", "Bearer",
                "cliente", cliente);
    }
}
