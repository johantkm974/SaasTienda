package com.example.demo.controller;

import com.example.demo.model.Pago;
import com.example.demo.model.Venta;
import com.example.demo.repository.VentaRepository;
import com.example.demo.service.JwtService;
import com.example.demo.service.PagoService;
import com.example.demo.service.PayPalService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;
    private final JwtService jwtService;
    private final PayPalService payPalService;
    private final VentaRepository ventaRepository;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @PostMapping("/webhook")
    public String webhook(@RequestBody Map<String, Object> payload,
                          @RequestParam(required = false) Integer empresaId) {
        pagoService.procesarWebhook(payload, empresaId != null ? empresaId : 1);
        return "ok";
    }

    @PostMapping("/webhook/mercadopago")
    public String webhookMercadopago(@RequestBody Map<String, Object> payload,
                                     @RequestParam(required = false) Integer empresaId) {
        pagoService.procesarWebhook(payload, empresaId != null ? empresaId : 1);
        return "ok";
    }

    @GetMapping("/retorno")
    public String retorno(@RequestParam(required = false) String status,
                          @RequestParam(required = false) String result,
                          @RequestParam(required = false) String id_venta) {
        String estado = result != null ? result : status;
        String destino = frontendUrl;
        if (id_venta != null) {
            Venta venta = ventaRepository.findById(Integer.parseInt(id_venta)).orElse(null);
            if (venta != null) {
                destino = frontendUrl + "/t/" + venta.getEmpresa().getId() + "/tienda";
            }
        }
        return "redirect:" + destino + "?payment=" + estado
                + (id_venta != null ? "&id_venta=" + id_venta : "");
    }

    @GetMapping("/paypal/retorno")
    public String paypalRetorno(@RequestParam(required = false) String ventaId,
                                @RequestParam(required = false) String token,
                                @RequestParam(required = false) String paymentId) {
        try {
            Integer idVenta = ventaId != null
                    ? Integer.parseInt(ventaId)
                    : payPalService.obtenerVentaIdPorOrden(token != null ? token : paymentId);
            payPalService.capturarOrden(idVenta, token != null ? token : paymentId);
            Venta venta = ventaRepository.findById(idVenta)
                    .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada"));
            return "redirect:" + frontendUrl + "/t/" + venta.getEmpresa().getId()
                    + "/tienda?payment=success&id_venta=" + idVenta;
        } catch (Exception e) {
            return "redirect:" + frontendUrl + "?payment=failure";
        }
    }

    @GetMapping("/paypal/cancelar")
    public String paypalCancelar(@RequestParam(required = false) String ventaId) {
        try {
            if (ventaId != null) {
                Venta venta = ventaRepository.findById(Integer.parseInt(ventaId)).orElse(null);
                if (venta != null) {
                    return "redirect:" + frontendUrl + "/t/" + venta.getEmpresa().getId()
                            + "/tienda?payment=cancel&id_venta=" + ventaId;
                }
            }
        } catch (Exception ignored) {
            // cae al redirect genérico
        }
        return "redirect:" + frontendUrl + "?payment=cancel";
    }

    @PostMapping("/venta/{ventaId}/preferencia")
    public Pago crearPreferencia(@PathVariable Integer ventaId,
                                 @RequestHeader("Authorization") String token) {
        return pagoService.crearPreferencia(
                jwtService.obtenerEmpresaIdDeToken(token), ventaId, null, null, null);
    }

    @GetMapping("/venta/{ventaId}/verificar")
    public Pago verificar(@PathVariable Integer ventaId,
                          @RequestHeader("Authorization") String token) {
        return pagoService.verificarPorVenta(ventaId, jwtService.obtenerEmpresaIdDeToken(token));
    }
}
