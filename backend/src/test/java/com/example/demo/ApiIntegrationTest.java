package com.example.demo;

import com.example.demo.model.Rol;
import com.example.demo.model.Usuario;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.RolRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.security.LoginRateLimitFilter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestFlywayConfig.class)
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private LoginRateLimitFilter loginRateLimitFilter;

    @BeforeEach
    void resetEstadoEntreTests() {
        jdbcTemplate.update("UPDATE usuario SET intentos_fallidos = 0, bloqueado_hasta = NULL");
        jdbcTemplate.update("UPDATE producto SET eliminado = 0");
        jdbcTemplate.update("UPDATE categoria SET eliminado = 0");
        jdbcTemplate.update("UPDATE proveedor SET eliminado = 0");
        loginRateLimitFilter.limpiarBuckets();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private String login(String correo, String contrasena) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"" + correo + "\",\"contrasena\":\"" + contrasena + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    // ------------------------------------------------------------------
    // Autenticación
    // ------------------------------------------------------------------

    @Test
    void loginSupremo_devuelveTokenYRol() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"supremo@saas.local\",\"contrasena\":\"12345678\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("SUPREMO"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void loginAdmin_devuelveToken() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"admin@techstore.pe\",\"contrasena\":\"12345678\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("Administrador"));
    }

    @Test
    void loginContrasenaIncorrecta_devuelve400() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"admin@techstore.pe\",\"contrasena\":\"malapass\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Contraseña incorrecta"));
    }

    @Test
    void loginValidacionCampos_devuelve400ConFieldErrors() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.correo").exists());
    }

    @Test
    void loginTrasCincoFallos_bloqueaCuentaCon429() throws Exception {
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"correo\":\"admin@techstore.pe\",\"contrasena\":\"malapass\"}"))
                    .andExpect(status().isBadRequest());
        }

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"admin@techstore.pe\",\"contrasena\":\"12345678\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("Cuenta bloqueada")));
    }

    @Test
    void accesoSinToken_devuelve403() throws Exception {
        mockMvc.perform(get("/api/empresas"))
                .andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------------
    // Rol SUPREMO (plataforma)
    // ------------------------------------------------------------------

    @Test
    void supremo_listaTodasLasEmpresas() throws Exception {
        String token = login("supremo@saas.local", "12345678");
        mockMvc.perform(get("/api/empresas").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));
    }

    @Test
    void supremo_suspendeYActivaEmpresa() throws Exception {
        String token = login("supremo@saas.local", "12345678");

        mockMvc.perform(put("/api/empresas/2/estado")
                        .param("estado", "SUSPENDIDO")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("SUSPENDIDO"));

        mockMvc.perform(put("/api/empresas/2/estado")
                        .param("estado", "ACTIVO")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ACTIVO"));
    }

    @Test
    void admin_noPuedeListarTodasLasEmpresas() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");
        mockMvc.perform(get("/api/empresas").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------------
    // Aislamiento entre tenants
    // ------------------------------------------------------------------

    @Test
    void admin_soloVeProductosDeSuEmpresa() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");
        mockMvc.perform(get("/api/productos").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(9)));
    }

    @Test
    void admin_noVeProductoDeOtraEmpresa() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");
        mockMvc.perform(get("/api/productos/1").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void venta_conProductoDeOtraEmpresa_devuelve404() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");
        mockMvc.perform(post("/api/ventas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"detalles\":[{\"producto\":{\"id\":1},\"cantidad\":1}]}"))
                .andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------
    // Permisos por rol
    // ------------------------------------------------------------------

    @Test
    void vendedor_noPuedeCrearProducto() throws Exception {
        Rol vendedor = rolRepository.findByNombre("Vendedor").orElseThrow();
        Usuario vendedorUsuario = new Usuario();
        vendedorUsuario.setNombre("Vendedor Test");
        vendedorUsuario.setDni("55555555");
        vendedorUsuario.setCorreo("vendedor.test@saas.local");
        vendedorUsuario.setContrasena(passwordEncoder.encode("12345678"));
        vendedorUsuario.setRol(vendedor);
        vendedorUsuario.setEmpresa(empresaRepository.findById(1).orElseThrow());
        usuarioRepository.save(vendedorUsuario);

        String token = login("vendedor.test@saas.local", "12345678");

        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Producto Prohibido\",\"precioVenta\":10.0,\"stockActual\":1,\"stockMinimo\":1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void vendedor_siPuedeListarProductos() throws Exception {
        Rol vendedor = rolRepository.findByNombre("Vendedor").orElseThrow();
        Usuario vendedorUsuario = new Usuario();
        vendedorUsuario.setNombre("Vendedor Test 2");
        vendedorUsuario.setDni("55555556");
        vendedorUsuario.setCorreo("vendedor.test2@saas.local");
        vendedorUsuario.setContrasena(passwordEncoder.encode("12345678"));
        vendedorUsuario.setRol(vendedor);
        vendedorUsuario.setEmpresa(empresaRepository.findById(1).orElseThrow());
        usuarioRepository.save(vendedorUsuario);

        String token = login("vendedor.test2@saas.local", "12345678");

        mockMvc.perform(get("/api/productos").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(15)));
    }

    // ------------------------------------------------------------------
    // Stock y ventas
    // ------------------------------------------------------------------

    @Test
    void ventaRegistrada_descuentaStockYCalculaTotal() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");

        mockMvc.perform(post("/api/ventas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"detalles\":[{\"producto\":{\"id\":16},\"cantidad\":2},{\"producto\":{\"id\":17},\"cantidad\":1}],\"metodoPago\":\"EFECTIVO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVenta").value(17200.00))
                .andExpect(jsonPath("$.estadoPago").value("PENDIENTE"));

        mockMvc.perform(get("/api/productos/16").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockActual").value(3));
    }

    @Test
    void ventaStockInsuficiente_devuelve409() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");

        mockMvc.perform(post("/api/ventas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"detalles\":[{\"producto\":{\"id\":18},\"cantidad\":99999}]}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("Stock insuficiente")));
    }

    @Test
    void ventaSinDetalles_devuelve400() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");

        mockMvc.perform(post("/api/ventas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"detalles\":[]}"))
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------
    // Soft delete y paginación
    // ------------------------------------------------------------------

    @Test
    void softDeleteProducto_ocultaPeroNoBorraFisicamente() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");

        mockMvc.perform(delete("/api/productos/24").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/productos").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(8)));

        Integer marcado = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM producto WHERE id = 24 AND eliminado = 1", Integer.class);
        assertThat(marcado).isEqualTo(1);
    }

    @Test
    void ventasPaginado_devuelveEstructuraPageResponse() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");

        mockMvc.perform(get("/api/ventas/paginado")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void recursoInexistente_devuelve404() throws Exception {
        String token = login("admin@inkaelectronics.pe", "12345678");
        mockMvc.perform(get("/api/ruta-inexistente").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
