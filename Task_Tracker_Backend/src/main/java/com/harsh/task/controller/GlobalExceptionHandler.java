package com.harsh.task.controller;

import com.harsh.task.domain.dto.ErrorResponseDto;
import com.harsh.task.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // --- 1. Existing Validation Handler ---
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(
            MethodArgumentNotValidException ex
    ){
        Map<String, String> errors = new HashMap<>();

        // Loop through ALL errors and map the field name to your custom message
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });

        // Returns {"title": "Title must be...", "dueDate": "Due date must..."}
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // --- 2. Existing Task Not Found Handler ---
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleExceptions(TaskNotFoundException ex){

        ErrorResponseDto errorResponseDto = new ErrorResponseDto(
                String.format( "Task with ID '%s' not found" , ex.getId())
        );

        // Changed to NOT_FOUND (404) as it's the standard for missing resources
        return new ResponseEntity<>(errorResponseDto , HttpStatus.NOT_FOUND);
    }

    // --- 3. NEW: Gamification User Not Found Handler ---
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(ResourceNotFoundException ex) {

        ErrorResponseDto errorResponseDto = new ErrorResponseDto(ex.getMessage());
        return new ResponseEntity<>(errorResponseDto, HttpStatus.NOT_FOUND);
    }

    // --- 4. NEW: Gamification Economy Handler ---
    @ExceptionHandler(InsufficientGemsException.class)
    public ResponseEntity<ErrorResponseDto> handleInsufficientGems(
            InsufficientGemsException ex) {
        return ResponseEntity
                .status(HttpStatus.PAYMENT_REQUIRED)
                .body(new ErrorResponseDto(ex.getMessage()));
    }

    // --- 5. NEW: Generic Safety Net ---
    // Catches any unexpected math engine or database crashes
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex) {

        // In production, you'd log the 'ex' stack trace here so you can debug it
        ErrorResponseDto errorResponseDto = new ErrorResponseDto("An unexpected error occurred.");
        return new ResponseEntity<>(errorResponseDto, HttpStatus.INTERNAL_SERVER_ERROR); // HTTP 500
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(new ErrorResponseDto(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST) // 400
                .body(new ErrorResponseDto(ex.getMessage()));
    }

    @ExceptionHandler(PriceChangedException.class)
    public ResponseEntity<ErrorResponseDto> handlePriceChanged(
            PriceChangedException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(new ErrorResponseDto(
                        "Price changed to " + ex.getActualCost() + " gems. " + ex.getMessage()
                ));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidRefreshToken(
            InvalidRefreshTokenException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED) // 401
                .body(new ErrorResponseDto(ex.getMessage()));
    }
}