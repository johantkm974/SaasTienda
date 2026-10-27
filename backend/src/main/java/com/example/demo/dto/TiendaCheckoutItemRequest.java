package com.example.demo.dto;

import lombok.Data;

@Data
public class TiendaCheckoutItemRequest {
    private Integer productoId;
    private Integer cantidad;
}
