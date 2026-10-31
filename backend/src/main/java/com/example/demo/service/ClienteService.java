package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Cliente;
import com.example.demo.model.ClienteAutenticacion;
import com.example.demo.model.Empresa;
import com.example.demo.model.EstadoEmpresa;
import com.example.demo.model.VerificacionRegistro;
import com.example.demo.repository.ClienteAutenticacionRepository;
import com.example.demo.repository.ClienteRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.VerificacionRegistroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClienteService {

    /** Validez del código de verificación de correo. */
    private static final Duration CADUCIDAD_CODIGO = Duration.ofMinutes(15);
    /** Intentos fallidos permitidos antes de invalidar el código. */
    private static final int MAX_INTENTOS_CODIGO = 5;
    private static final SecureRandom ALEATORIO = new SecureRandom();

    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClienteAutenticacionRepository clienteAutenticacionRepository;
    private final VerificacionRegistroRepository verificacionRegistroRepository;
    private final JwtService jwtService;
    private final EmailBrevoService emailBrevoService;

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
     * Registro con contraseña desde la tienda pública.
     *
     * Si el correo ya existe como cliente invitado (creado en el checkout sin
     * cuenta) NO se vincula la todavía: se pide un código enviado a ese correo,
     * que demuestra su propiedad. Sin eso, cualquiera podría registrarse con el
     * correo de otra persona y quedarse con su historial de compras, teléfono y
     * dirección. Si el correo no tenía registro previo no hay nada que apropiarse
     * y el registro procede directamente.
     *
     * @return la sesión (token) si no hizo falta verificar, o
     *         {@code requiereVerificacion=true} si hay que introducir el código.
     */
    @Transactional
    public Map<String, Object> registrarConCuenta(Integer empresaId, String nombres, String apellidos,
                                                  String correo, String telefono, String direccion,
                                                  String contrasena) {
        if (contrasena == null || contrasena.isBlank()) {
            throw new RuntimeException("La contrasena es obligatoria");
        }
        if (clienteAutenticacionRepository.findByCorreo(correo).isPresent()) {
            throw new RuntimeException("El correo ya tiene una cuenta registrada");
        }

        if (clienteRepository.findByCorreoAndEmpresaId(correo, empresaId).isPresent()) {
            exigirEnvioCodigo(empresaId, nombres, apellidos, correo, telefono, direccion, contrasena);
            return Map.of(
                    "requiereVerificacion", true,
                    "correo", correo,
                    "mensaje", "Ese correo ya tiene datos en esta tienda. "
                            + "Te enviamos un código para confirmar que es tuyo.");
        }

        Cliente cliente = registrar(empresaId, construirCliente(
                nombres, apellidos, correo, telefono, direccion));
        return crearCuenta(cliente, correo, contrasena);
    }

    /**
     * Crea el registro de verificación y envía el código. Si el correo no puede
     * enviarse, se invalida el registro y se lanza el error: nunca se vincula la
     * cuenta sin haber podido demostrar la propiedad del correo (fallo cerrado).
     */
    private void exigirEnvioCodigo(Integer empresaId, String nombres, String apellidos,
                                   String correo, String telefono, String direccion,
                                   String contrasena) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("La tienda no existe"));

        String codigo = generarCodigo();
        LocalDateTime ahora = LocalDateTime.now();

        verificacionRegistroRepository.deleteByEmpresaIdAndCorreo(empresaId, correo);

        VerificacionRegistro pendiente = new VerificacionRegistro();
        pendiente.setEmpresa(empresa);
        pendiente.setCorreo(correo);
        pendiente.setNombres(nombres);
        pendiente.setApellidos(apellidos);
        pendiente.setTelefono(telefono);
        pendiente.setDireccion(direccion);
        pendiente.setPasswordHash(passwordEncoder.encode(contrasena));
        pendiente.setCodigoHash(passwordEncoder.encode(codigo));
        pendiente.setIntentos(0);
        pendiente.setExpiraEn(ahora.plus(CADUCIDAD_CODIGO));
        pendiente.setCreadoEn(ahora);
        verificacionRegistroRepository.save(pendiente);

        boolean enviado = emailBrevoService.enviar(empresaId, correo, nombres,
                "Código de verificación", htmlCodigo(codigo));

        if (!enviado) {
            verificacionRegistroRepository.delete(pendiente);
            throw new RuntimeException("No se pudo enviar el código de verificación. "
                    + "Inténtalo de nuevo en unos minutos.");
        }
    }

    /**
     * Comprueba el código y completa el registro, vinculando la cuenta al cliente
     * existente. El código caduca, es de un solo uso y admite pocos intentos.
     */
    @Transactional
    public Map<String, Object> verificarRegistro(Integer empresaId, String correo, String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new RuntimeException("El código es obligatorio");
        }
        VerificacionRegistro pendiente = verificacionRegistroRepository
                .findByEmpresaIdAndCorreo(empresaId, correo)
                .orElseThrow(() -> new RuntimeException("No hay un registro pendiente para ese correo"));

        if (pendiente.getExpiraEn().isBefore(LocalDateTime.now())) {
            verificacionRegistroRepository.delete(pendiente);
            throw new RuntimeException("El código ha caducado. Regístrate de nuevo.");
        }
        if (pendiente.getIntentos() >= MAX_INTENTOS_CODIGO) {
            verificacionRegistroRepository.delete(pendiente);
            throw new RuntimeException("Demasiados intentos. Regístrate de nuevo.");
        }
        if (!passwordEncoder.matches(codigo.trim(), pendiente.getCodigoHash())) {
            pendiente.setIntentos(pendiente.getIntentos() + 1);
            verificacionRegistroRepository.save(pendiente);
            throw new RuntimeException("Código incorrecto");
        }
        if (clienteAutenticacionRepository.findByCorreo(correo).isPresent()) {
            verificacionRegistroRepository.delete(pendiente);
            throw new RuntimeException("El correo ya tiene una cuenta registrada");
        }

        Cliente cliente = clienteRepository.findByCorreoAndEmpresaId(correo, empresaId)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado"));

        ClienteAutenticacion autenticacion = new ClienteAutenticacion();
        autenticacion.setCliente(cliente);
        autenticacion.setCorreo(correo);
        autenticacion.setPasswordHash(pendiente.getPasswordHash());
        autenticacion.setUltimoAcceso(LocalDateTime.now());
        clienteAutenticacionRepository.save(autenticacion);

        verificacionRegistroRepository.delete(pendiente);
        return sesion(cliente, correo);
    }

    private Map<String, Object> crearCuenta(Cliente cliente, String correo, String contrasena) {
        ClienteAutenticacion autenticacion = new ClienteAutenticacion();
        autenticacion.setCliente(cliente);
        autenticacion.setCorreo(correo);
        autenticacion.setPasswordHash(passwordEncoder.encode(contrasena));
        autenticacion.setUltimoAcceso(LocalDateTime.now());
        clienteAutenticacionRepository.save(autenticacion);
        return sesion(cliente, correo);
    }

    private String generarCodigo() {
        return String.format("%06d", ALEATORIO.nextInt(1_000_000));
    }

    private String htmlCodigo(String codigo) {
        return """
                <div style="font-family:Arial,Helvetica,sans-serif;max-width:460px;margin:0 auto;color:#0f172a">
                  <h2 style="margin:0 0 12px">Confirma tu correo</h2>
                  <p style="margin:0 0 16px">Introduce este código para terminar de crear tu cuenta:</p>
                  <p style="font-size:34px;letter-spacing:10px;font-weight:bold;text-align:center;
                            background:#f1f5f9;padding:16px 0;border-radius:12px;margin:0 0 16px">%s</p>
                  <p style="margin:0;color:#64748b;font-size:13px">
                    Caduca en 15 minutos y sólo puede usarse una vez.
                    Si no has sido tú, ignora este mensaje: no se habrá creado ninguna cuenta.
                  </p>
                </div>
                """.formatted(codigo);
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
