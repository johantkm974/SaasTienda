package com.example.demo.service;

import com.example.demo.model.Proveedor;
import com.example.demo.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public Proveedor crear(Proveedor proveedor){
        proveedor.setId(null);
        return proveedorRepository.save(proveedor);
    }
    public Proveedor actualizar(Integer id, Proveedor proveedorActualizado){
        return proveedorRepository.findById(id).map(proveedorExistente->{

            proveedorExistente.setNombre(proveedorActualizado.getNombre());
            proveedorExistente.setIdentificacion(proveedorActualizado.getIdentificacion());
            proveedorExistente.setTelefono(proveedorActualizado.getTelefono());
            proveedorExistente.setCorreo(proveedorActualizado.getCorreo());

            proveedorExistente.setEmpresa(proveedorActualizado.getEmpresa());

            return proveedorRepository.save(proveedorExistente);

        }).orElseThrow(()-> new RuntimeException("Proveedor no enocntrado con el ID"+ id));
    }

    public List<Proveedor> listarPorEmpresa(Integer empresaId) {
        return proveedorRepository.findByEmpresaId(empresaId);
    }
    public List<Proveedor> listarTodos(){
        return proveedorRepository.findAll();
    }
    public Proveedor buscarPorId(Integer id){
        return proveedorRepository.findById(id).orElseThrow(()->new RuntimeException("Proveedor no encontrado con el id"+ id)); 
    }

    public void eliminar(Integer id){
        if(!proveedorRepository.existsById(id)){
            throw new RuntimeException("No se puede eliminar, el proveedor no existe");
        }
        proveedorRepository.deleteById(id);
    }
}

