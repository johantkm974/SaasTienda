package com.example.demo.controller;

import com.example.demo.service.TiendaService;
import com.example.demo.service.TiendaService.CheckoutPublicoRequest;
import com.example.demo.service.TiendaService.CheckoutRequest;
import com.example.demo.service.TiendaService.LoginClienteRequest;
import com.example.demo.service.TiendaService.ProductoTiendaResponse;
import com.example.demo.service.TiendaService.RegistroClienteRequest;
import com.example.demo.service.TiendaService.VentaClienteResponse;
import com.example.demo.repository.VentaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tienda")
public class TiendaController {

    private final TiendaService tiendaService;
    private final VentaRepository ventaRepository;

    public TiendaController(TiendaService tiendaService, VentaRepository ventaRepository) {
        this.tiendaService = tiendaService;
        this.ventaRepository = ventaRepository;
    }

    @GetMapping("/productos")
    public List<ProductoTiendaResponse> listarProductos() {
        return tiendaService.listarProductos();
    }

    @GetMapping("/productos-comprados")
    public List<ProductoTiendaResponse> listarProductosComprados() {
        return ventaRepository.findProductosCompradosPorEmpresa(tiendaService.empresaIdActual()).stream()
                .map(ProductoTiendaResponse::from)
                .toList();
    }

    @GetMapping("/productos/{id}")
    public ProductoTiendaResponse obtenerProducto(@PathVariable Integer id) {
        try {
            return tiendaService.obtenerProducto(id);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage(), ex);
        }
    }

    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody RegistroClienteRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(tiendaService.registrarCliente(request));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginClienteRequest request) {
        try {
            return tiendaService.loginCliente(request);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, ex.getMessage(), ex);
        }
    }

    @PostMapping("/checkout")
    public VentaClienteResponse checkout(Authentication authentication, @RequestBody CheckoutRequest request) {
        validarCliente(authentication);
        try {
            return tiendaService.checkout(authentication.getName(), request);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    @PostMapping("/checkout/iniciar")
    public VentaClienteResponse checkoutIniciar(Authentication authentication, @RequestBody CheckoutRequest request) {
        validarCliente(authentication);
        try {
            return tiendaService.checkoutConPago(authentication.getName(), request);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    // Checkout sin login: el cliente se crea o reutiliza según el correo enviado
    @PostMapping("/checkout/publico")
    public VentaClienteResponse checkoutPublico(@RequestBody CheckoutPublicoRequest request) {
        return tiendaService.checkoutPublico(request);
    }

    // Consulta de compras sin login, por correo
    @GetMapping("/mis-compras-publico")
    public List<VentaClienteResponse> misComprasPublico(@RequestParam String correo) {
        return tiendaService.misCompras(correo);
    }

    @GetMapping("/mis-compras")
    public List<VentaClienteResponse> misCompras(Authentication authentication) {
        validarCliente(authentication);
        try {
            return tiendaService.misCompras(authentication.getName());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    private void validarCliente(Authentication authentication) {
        boolean esCliente = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_CLIENTE".equals(authority.getAuthority()));
        if (!esCliente) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo clientes pueden comprar en la tienda");
        }
    }
}
