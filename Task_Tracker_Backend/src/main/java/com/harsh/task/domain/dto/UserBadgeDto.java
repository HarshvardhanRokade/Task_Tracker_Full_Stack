package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserBadgeDto {
    private String badgeKey;
    private String name;
    private String description;
    private String icon;
    private String category;
    private String earnedAt;
}