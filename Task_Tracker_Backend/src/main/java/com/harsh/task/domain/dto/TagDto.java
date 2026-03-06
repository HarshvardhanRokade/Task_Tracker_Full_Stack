package com.harsh.task.domain.dto;

import java.util.UUID;

public record TagDto (
        UUID id,
        String name,
        String color
){
}
