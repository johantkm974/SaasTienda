package com.example.demo.service;

import com.example.demo.dto.EnvioDashboardResponse;
import com.example.demo.dto.EnvioUpdateRequest;
import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Envio;
import com.example.demo.model.Venta;
import com.example.demo.repository.EnvioRepository;
import com.example.demo.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnvioService {

    private final EnvioRepository envioRepository;
    private final VentaRepository ventaRepository;

    public Envio crear(Integer empresaId, Integer ventaId, Envio envio) {
        Venta venta = ventaRepository.findByIdAndEmpresaId(ventaId, empresaId)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada en su empresa"));

        envio.setId(null);
        envio.setVenta(venta);
        envio.setEmpresa(venta.getEmpresa());
        if (envio.getEstadoEnvio() == null) {
            envio.setEstadoEnvio("PREPARACION");
        }
        return envioRepository.save(envio);
    }

    public List<EnvioDashboardResponse> listarPorEmpresa(Integer empresaId) {
        return envioRepository.findByEmpresaId(empresaId).stream()
                .map(EnvioService::aDashboard)
                .toList();
    }

    public List<EnvioDashboardResponse> listarPorEstado(Integer empresaId, String estado) {
        return envioRepository.findByEmpresaIdAndEstadoEnvio(empresaId, estado).stream()
                .map(EnvioService::aDashboard)
                .toList();
    }

    private static EnvioDashboardResponse aDashboard(Envio e) {
        com.example.demo.model.Venta v = e.getVenta();
        return new EnvioDashboardResponse(
                e.getId(),
                v.getId(),
                v.getEmpresa() != null ? v.getEmpresa().getNombreComercial() : null,
                v.getCliente() != null
                        ? (v.getCliente().getNombres() + " " + v.getCliente().getApellidos()).trim()
                        : null,
                v.getCliente() != null ? v.getCliente().getTelefono() : null,
                e.getDireccionEntrega(),
                e.getDistrito(),
                e.getCostoEnvio(),
                v.getTotalVenta(),
                v.getMetodoPago(),
                v.getEstadoVenta(),
                v.getEstadoPago(),
                e.getEstadoEnvio(),
                e.getTransportista(),
                e.getGuiaTracking(),
                v.getFecha(),
                e.getFechaDespacho(),
                e.getFechaEntrega());
    }

    public Envio buscarPorId(Integer id, Integer empresaId) {
        return envioRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new NotFoundException("Envío no encontrado"));
    }

    public Envio buscarPorVenta(Integer ventaId, Integer empresaId) {
        return envioRepository.findByVentaIdAndEmpresaId(ventaId, empresaId)
                .orElseThrow(() -> new NotFoundException("Envío no encontrado para la venta"));
    }

    public Envio actualizar(Integer id, Integer empresaId, EnvioUpdateRequest actualizado) {
        return envioRepository.findByIdAndEmpresaId(id, empresaId)
                .map(existente -> {
                    if (actualizado.direccionEntrega() != null) {
                        existente.setDireccionEntrega(actualizado.direccionEntrega());
                    }
                    if (actualizado.distrito() != null) {
                        existente.setDistrito(actualizado.distrito());
                    }
                    if (actualizado.costoEnvio() != null) {
                        existente.setCostoEnvio(actualizado.costoEnvio());
                    }
                    if (actualizado.transportista() != null) {
                        existente.setTransportista(actualizado.transportista());
                    }
                    if (actualizado.guiaTracking() != null) {
                        existente.setGuiaTracking(actualizado.guiaTracking());
                    }
                    return envioRepository.save(existente);
                })
                .orElseThrow(() -> new NotFoundException("Envío no encontrado"));
    }

    public Envio cambiarEstado(Integer id, Integer empresaId, String nuevoEstado) {
        Envio envio = buscarPorId(id, empresaId);
        envio.setEstadoEnvio(nuevoEstado);
        if ("EN_CAMINO".equals(nuevoEstado)) {
            envio.setFechaDespacho(LocalDateTime.now());
        }
        if ("ENTREGADO".equals(nuevoEstado)) {
            envio.setFechaEntrega(LocalDateTime.now());
        }
        return envioRepository.save(envio);
    }

    public void eliminar(Integer id, Integer empresaId) {
        Envio envio = buscarPorId(id, empresaId);
        envioRepository.delete(envio);
    }
}
