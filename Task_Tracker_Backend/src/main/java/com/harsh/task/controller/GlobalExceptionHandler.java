package com.harsh.task.controller;

import com.harsh.task.domain.dto.ErrorResponseDto;
import com.harsh.task.exception.TaskNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Updated Validation Handler
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


    // 2. Fixed Not Found Handler (Added the missing annotation!)
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleExceptions(TaskNotFoundException ex){

        ErrorResponseDto errorResponseDto = new ErrorResponseDto(
                String.format( "Task with ID '%s' not found" , ex.getId())
        );

        // Changed to NOT_FOUND (404) as it's the standard for missing resources
        return new ResponseEntity<>(errorResponseDto , HttpStatus.NOT_FOUND);
    }
}