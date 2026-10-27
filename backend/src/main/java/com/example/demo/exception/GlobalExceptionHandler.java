package com.example.demo.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException e, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, e.getMessage(), request);
    }

    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<ApiError> handleStockInsuficiente(StockInsuficienteException e, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, e.getMessage(), request);
    }

    @ExceptionHandler({CuentaBloqueadaException.class, DemasiadasSolicitudesException.class})
    public ResponseEntity<ApiError> handleBloqueadoODemasiadas(RuntimeException e, HttpServletRequest request) {
        return build(HttpStatus.TOO_MANY_REQUESTS, e.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException e, HttpServletRequest request) {
        Map<String, String> errores = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(err ->
                errores.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiError.withFields(
                HttpStatus.BAD_REQUEST.value(), "VALIDATION_ERROR",
                "Datos inválidos", request.getRequestURI(), errores));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException e, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Cuerpo de la petición inválido", request);
    }

    @ExceptionHandler(InvalidDataAccessApiUsageException.class)
    public ResponseEntity<ApiError> handleInvalidId(InvalidDataAccessApiUsageException e, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Solicitud inválida: el usuario SUPREMO no pertenece a una empresa", request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException e, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, "No tiene permisos para esta acción", request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException e, HttpServletRequest request) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "Método no permitido: " + e.getMessage(), request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNoResource(NoResourceFoundException e, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Recurso no encontrado", request);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(RuntimeException e, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, e.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception e, HttpServletRequest request) {
        log.error("Error no controlado en {} {}", request.getMethod(), request.getRequestURI(), e);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", request);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(
                ApiError.of(status.value(), status.getReasonPhrase(), message, request.getRequestURI()));
    }
}
