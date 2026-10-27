package com.example.demo.service;

import com.example.demo.model.Envio;
import com.example.demo.model.Venta;
import com.example.demo.repository.EnvioRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

/**
 * Genera el documento de venta (recibo PDF) de una compra de la tienda pública,
 * y opcionalmente lo envía por correo al cliente (Brevo) cuando la empresa lo configuró.
 */
@Service
@RequiredArgsConstructor
public class ReciboPdfService {

    private final EnvioRepository envioRepository;
    private final EmailBrevoService emailBrevoService;

    public byte[] generarRecibo(Venta venta) {
        Envio envio = envioRepository.findByVentaIdAndEmpresaId(
                        venta.getId(), venta.getEmpresa().getId())
                .orElse(null);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font negrita = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font celdaFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        Paragraph titulo = new Paragraph("RECIBO DE VENTA", tituloFont);
        titulo.setAlignment(Element.ALIGN_CENTER);
        doc.add(titulo);

        String empresaNombre = venta.getEmpresa().getNombreComercial();
        Paragraph empresaLinea = new Paragraph(empresaNombre, negrita);
        empresaLinea.setAlignment(Element.ALIGN_CENTER);
        doc.add(empresaLinea);

        if (venta.getEmpresa().getRuc() != null && !venta.getEmpresa().getRuc().isBlank()) {
            Paragraph ruc = new Paragraph("RUC: " + venta.getEmpresa().getRuc(), subFont);
            ruc.setAlignment(Element.ALIGN_CENTER);
            doc.add(ruc);
        }
        if (venta.getEmpresa().getSlogan() != null && !venta.getEmpresa().getSlogan().isBlank()) {
            Paragraph slogan = new Paragraph(venta.getEmpresa().getSlogan(), subFont);
            slogan.setAlignment(Element.ALIGN_CENTER);
            doc.add(slogan);
        }

        doc.add(new Paragraph(" "));

        PdfPTable cabecera = new PdfPTable(2);
        cabecera.setWidthPercentage(100);
        cabecera.setWidths(new float[]{2f, 1.2f});

        PdfPCell datosCliente = new PdfPCell();
        datosCliente.setBorder(PdfPCell.NO_BORDER);
        String clienteNombre = (venta.getCliente().getNombres() == null ? "" : venta.getCliente().getNombres())
                + " " + (venta.getCliente().getApellidos() == null ? "" : venta.getCliente().getApellidos());
        datosCliente.addElement(new Paragraph("Cliente", negrita));
        datosCliente.addElement(new Paragraph(clienteNombre.trim(), celdaFont));
        if (venta.getCliente().getCorreo() != null) {
            datosCliente.addElement(new Paragraph("Correo: " + venta.getCliente().getCorreo(), celdaFont));
        }
        if (venta.getCliente().getTelefono() != null && !venta.getCliente().getTelefono().isBlank()) {
            datosCliente.addElement(new Paragraph("Telefono: " + venta.getCliente().getTelefono(), celdaFont));
        }

        PdfPCell datosVenta = new PdfPCell();
        datosVenta.setBorder(PdfPCell.NO_BORDER);
        datosVenta.addElement(new Paragraph("Documento N° " + venta.getId(), negrita));
        datosVenta.addElement(new Paragraph("Fecha: " + venta.getFecha()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), celdaFont));
        datosVenta.addElement(new Paragraph("Metodo de pago: "
                + (venta.getMetodoPago() == null ? "-" : venta.getMetodoPago()), celdaFont));
        datosVenta.addElement(new Paragraph("Estado: " + venta.getEstadoVenta(), celdaFont));

        cabecera.addCell(datosCliente);
        cabecera.addCell(datosVenta);
        doc.add(cabecera);

        doc.add(new Paragraph(" "));

        PdfPTable tabla = new PdfPTable(5);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{3.2f, 1f, 1.4f, 1.4f, 1.4f});

        for (String encabezado : new String[]{"Producto", "Cant.", "P. Unitario", "Subtotal", "Stock"}) {
            PdfPCell celda = new PdfPCell(new Paragraph(encabezado, negrita));
            celda.setHorizontalAlignment(Element.ALIGN_CENTER);
            tabla.addCell(celda);
        }

        BigDecimal subtotalProductos = BigDecimal.ZERO;
        for (var detalle : venta.getDetalles()) {
            tabla.addCell(new Paragraph(detalle.getProducto().getNombre(), celdaFont));
            tabla.addCell(new Paragraph(String.valueOf(detalle.getCantidad()), celdaFont));
            tabla.addCell(new Paragraph(detalle.getPrecioUnitario().toPlainString(), celdaFont));
            tabla.addCell(new Paragraph(detalle.getSubtotal().toPlainString(), celdaFont));
            tabla.addCell(new Paragraph(detalle.getProducto().getStockActual() == null
                    ? "-" : String.valueOf(detalle.getProducto().getStockActual()), celdaFont));
            subtotalProductos = subtotalProductos.add(detalle.getSubtotal());
        }

        PdfPCell celdaVacia = new PdfPCell(new Paragraph(""));
        celdaVacia.setBorder(PdfPCell.NO_BORDER);
        tabla.addCell(celdaVacia);
        tabla.addCell(celdaVacia);
        tabla.addCell(celdaVacia);
        tabla.addCell(celdaVacia);
        tabla.addCell(celdaVacia);
        doc.add(tabla);

        doc.add(new Paragraph(" "));

        BigDecimal costoEnvio = envio != null ? envio.getCostoEnvio() : BigDecimal.ZERO;
        PdfPTable totales = new PdfPTable(2);
        totales.setWidthPercentage(60);
        totales.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totales.setWidths(new float[]{1.6f, 1f});

        totales.addCell(new Paragraph("Subtotal", celdaFont));
        totales.addCell(new Paragraph(subtotalProductos.toPlainString(), celdaFont));
        totales.addCell(new Paragraph("Envio", celdaFont));
        totales.addCell(new Paragraph(costoEnvio.toPlainString(), celdaFont));
        PdfPCell totalCelda = new PdfPCell(new Paragraph("TOTAL", negrita));
        totales.addCell(totalCelda);
        totales.addCell(new Paragraph(venta.getTotalVenta().toPlainString(), negrita));
        doc.add(totales);

        doc.add(new Paragraph(" "));
        Paragraph gracias = new Paragraph("Gracias por su compra", subFont);
        gracias.setAlignment(Element.ALIGN_CENTER);
        doc.add(gracias);

        doc.close();
        return out.toByteArray();
    }

    /** Envía el recibo PDF al correo del cliente si la empresa tiene Brevo configurado (nunca lanza error). */
    public void enviarRecibo(Venta venta) {
        if (venta.getCliente() == null || venta.getCliente().getCorreo() == null) {
            return;
        }
        try {
            byte[] pdf = generarRecibo(venta);
            String html = "<p>Hola <strong>" + venta.getCliente().getNombres()
                    + "</strong>, gracias por su compra.</p>"
                    + "<p>Adjuntamos el recibo de su pedido <strong>#" + venta.getId() + "</strong>.</p>";
            emailBrevoService.enviarPdf(
                    venta,
                    "recibo_venta_" + venta.getId() + ".pdf",
                    pdf,
                    "Recibo de compra #" + venta.getId() + " - " + venta.getEmpresa().getNombreComercial(),
                    html);
        } catch (Exception e) {
            // Nunca bloquear el flujo de pago por un fallo de correo
        }
    }
}
