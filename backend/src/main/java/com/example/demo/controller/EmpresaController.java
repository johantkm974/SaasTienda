package com.example.demo.controller;

import com.example.demo.model.Empresa;
import com.example.demo.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;

    @PostMapping
    public Empresa registrar(@RequestBody Empresa empresa) {
        return empresaService.registrar(empresa);
    }
    @PutMapping("/{id}")
    public Empresa actualizar(@PathVariable Integer id,@RequestBody Empresa empresa){
        return empresaService.actualizar(id, empresa);
    }

    @GetMapping
    public List<Empresa> listar() {
        return empresaService.listar();
    }
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id){
        empresaService.eliminar(id);
    }

    @GetMapping("/{id}")
    public Empresa buscar(@PathVariable Integer id) {
        return empresaService.buscarPorId(id);
    }
}
