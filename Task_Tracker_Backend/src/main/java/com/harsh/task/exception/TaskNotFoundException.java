package com.harsh.task.exception;

import java.util.UUID;

public class TaskNotFoundException extends RuntimeException{

    public static final String ERROR_MESSAGE =
            "Task with Id '%s' does not exist";

    private final UUID id;

    public TaskNotFoundException(UUID id){
        super(String.format(ERROR_MESSAGE , id));
        this.id = id;
    }

    public UUID getId(){
        return id;
    }
}
