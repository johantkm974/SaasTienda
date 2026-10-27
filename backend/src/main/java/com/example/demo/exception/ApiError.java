package com.example.demo.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Formato de error estándar de toda la API.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(LocalDateTime.now(), status, error, message, path, null);
    }

    public static ApiError withFields(int status, String error, String message, String path,
                                      Map<String, String> fieldErrors) {
        return new ApiError(LocalDateTime.now(), status, error, message, path, fieldErrors);
    }
}
