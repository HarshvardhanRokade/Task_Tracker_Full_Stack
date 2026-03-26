package com.harsh.task.controller;

import com.harsh.task.domain.dto.UserBadgeDto;
import com.harsh.task.badge.BadgeService;
import com.harsh.task.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ResponseEntity<List<UserBadgeDto>> getMyBadges(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        List<UserBadgeDto> badges = badgeService
                .getUserBadges(currentUser.getUserId())
                .stream()
                .map(ub -> UserBadgeDto.builder()
                        .badgeKey(ub.getBadge().getBadgeKey())
                        .name(ub.getBadge().getName())
                        .description(ub.getBadge().getDescription())
                        .icon(ub.getBadge().getIcon())
                        .category(ub.getBadge().getCategory())
                        .earnedAt(ub.getEarnedAt()
                                .format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                        .build())
                .toList();

        return ResponseEntity.ok(badges);
    }
}