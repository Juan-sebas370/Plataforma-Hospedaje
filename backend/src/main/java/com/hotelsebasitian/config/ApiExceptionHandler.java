package com.hotelsebasitian.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validationError() {
        return ResponseEntity.badRequest().body(Map.of("error", "Solicitud invalida"));
    }

    /** JSON mal formado o parámetros con tipo equivocado: no se devuelven detalles internos del parser. */
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, String>> malformedRequest() {
        return error(HttpStatus.BAD_REQUEST, "Solicitud invalida");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> invalidCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Credenciales invalidas"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> accessDenied(AccessDeniedException exception) {
        return error(HttpStatus.FORBIDDEN, exception.getMessage() == null ? "Acceso denegado" : exception.getMessage());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> statusError(ResponseStatusException exception) {
        String message = exception.getReason() == null ? "No se pudo procesar la solicitud" : exception.getReason();
        return error(HttpStatus.valueOf(exception.getStatusCode().value()), message);
    }

    /** Registro duplicado u otra restricción de la base: el texto SQL queda solo en el log. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> conflict(DataIntegrityViolationException exception) {
        log.warn("Restricción de base de datos: {}", exception.getMostSpecificCause().getMessage());
        return error(HttpStatus.CONFLICT, "Los datos entran en conflicto con un registro existente");
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> databaseError(DataAccessException exception) {
        log.error("Error de base de datos", exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno. Intenta de nuevo en un momento");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handledRuntimeError(RuntimeException exception) {
        String message = exception.getMessage() == null || exception.getMessage().isBlank()
                ? "No se pudo procesar la solicitud"
                : exception.getMessage();
        return ResponseEntity.badRequest().body(Map.of("error", message, "message", message));
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message, "message", message));
    }
}
