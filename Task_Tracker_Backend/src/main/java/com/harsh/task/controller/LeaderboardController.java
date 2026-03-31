package com.harsh.task.controller;

import com.harsh.task.domain.dto.*;
import com.harsh.task.leaderboard.LeaderboardService;
import com.harsh.task.leaderboard.PublicProfileService;
import com.harsh.task.leaderboard.SeasonService;
import com.harsh.task.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final SeasonService seasonService;
    private final PublicProfileService publicProfileService;

    @GetMapping
    public ResponseEntity<LeaderboardResponseDto> getLeaderboard(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(
                leaderboardService.getLeaderboard(currentUser.getUserId())
        );
    }

    @GetMapping("/season")
    public ResponseEntity<SeasonLeaderboardDto> getSeasonLeaderboard(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(
                seasonService.getSeasonLeaderboard(currentUser.getUserId())
        );
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<PublicProfileDto> getPublicProfile(
            @PathVariable String username,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        // currentUser is null when request is unauthenticated
        Long currentUserId = currentUser != null
                ? currentUser.getUserId()
                : null;

        return ResponseEntity.ok(
                publicProfileService.getProfile(username, currentUserId)
        );
    }
}