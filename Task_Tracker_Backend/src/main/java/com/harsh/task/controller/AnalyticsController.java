package com.harsh.task.controller;

import com.harsh.task.domain.dto.*;
import com.harsh.task.security.AuthenticatedUser;
import com.harsh.task.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(
                analyticsService.getSummary(currentUser.getUserId())
        );
    }

    @GetMapping("/tasks")
    public ResponseEntity<TaskAnalyticsDto> getTaskAnalytics(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(defaultValue = "WEEK") AnalyticsPeriod period) {
        return ResponseEntity.ok(
                analyticsService.getTaskAnalytics(currentUser.getUserId(), period)
        );
    }

    @GetMapping("/pomodoro")
    public ResponseEntity<PomodoroAnalyticsDto> getPomodoroAnalytics(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(defaultValue = "WEEK") AnalyticsPeriod period) {
        return ResponseEntity.ok(
                analyticsService.getPomodoroAnalytics(currentUser.getUserId(), period)
        );
    }

    @GetMapping("/progression")
    public ResponseEntity<ProgressionAnalyticsDto> getProgressionAnalytics(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(defaultValue = "MONTH") AnalyticsPeriod period) {
        return ResponseEntity.ok(
                analyticsService.getProgressionAnalytics(
                        currentUser.getUserId(), period)
        );
    }
}