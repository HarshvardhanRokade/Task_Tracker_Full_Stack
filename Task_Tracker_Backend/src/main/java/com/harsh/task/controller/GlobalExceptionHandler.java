package com.harsh.task.controller;

import com.harsh.task.domain.dto.ErrorResponseDto;
import com.harsh.task.exception.TaskNotFoundException;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidationException(
            MethodArgumentNotValidException ex
    ){
        String errorMessage =
                ex.getBindingResult().getFieldErrors().stream().findFirst()
                        .map(DefaultMessageSourceResolvable::getDefaultMessage)
                        .orElse("Validation Failed");

        ErrorResponseDto errorDto = new ErrorResponseDto(errorMessage);

        return  new ResponseEntity<>(errorDto , HttpStatus.BAD_REQUEST);
    }


    public ResponseEntity<ErrorResponseDto> handleExceptions(TaskNotFoundException ex){

        ErrorResponseDto errorResponseDto = new ErrorResponseDto(
               String.format( "Task with ID '%s' not found" , ex.getId())
        );

        return new ResponseEntity<>(errorResponseDto , HttpStatus.BAD_REQUEST);
    }
}
