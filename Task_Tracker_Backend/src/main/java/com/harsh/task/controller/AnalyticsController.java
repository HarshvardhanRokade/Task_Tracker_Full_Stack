package com.harsh.task.controller;

import com.harsh.task.domain.dto.*;
import com.harsh.task.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary(
            @RequestParam Long userId) {
        return ResponseEntity.ok(analyticsService.getSummary(userId));
    }

    @GetMapping("/tasks")
    public ResponseEntity<TaskAnalyticsDto> getTaskAnalytics(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "WEEK") AnalyticsPeriod period) {
        return ResponseEntity.ok(
                analyticsService.getTaskAnalytics(userId, period));
    }

    @GetMapping("/pomodoro")
    public ResponseEntity<PomodoroAnalyticsDto> getPomodoroAnalytics(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "WEEK") AnalyticsPeriod period) {
        return ResponseEntity.ok(
                analyticsService.getPomodoroAnalytics(userId, period));
    }

    @GetMapping("/progression")
    public ResponseEntity<ProgressionAnalyticsDto> getProgressionAnalytics(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "MONTH") AnalyticsPeriod period) {
        return ResponseEntity.ok(
                analyticsService.getProgressionAnalytics(userId, period));
    }
}