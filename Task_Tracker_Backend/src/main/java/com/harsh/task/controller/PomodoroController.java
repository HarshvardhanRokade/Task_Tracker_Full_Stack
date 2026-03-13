package com.harsh.task.controller;

import com.harsh.task.domain.dto.PomodoroRewardDto;
import com.harsh.task.service.PomodoroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Pomodoro Session Management API.
 * * Note: All endpoints return 404 if the userId is not found.
 * The /complete endpoint favors degraded success and will return a 200 OK
 * with a PomodoroRewardDto even if the session state was invalid or expired.
 */
@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroService pomodoroService;

    @PostMapping("/{userId}/start")
    public ResponseEntity<Void> startSession(@PathVariable Long userId) {
        pomodoroService.startSession(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/pause")
    public ResponseEntity<Void> pauseSession(@PathVariable Long userId) {
        pomodoroService.pauseSession(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/resume")
    public ResponseEntity<Void> resumeSession(@PathVariable Long userId) {
        pomodoroService.resumeSession(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/complete")
    public ResponseEntity<PomodoroRewardDto> completeSession(@PathVariable Long userId) {
        PomodoroRewardDto reward = pomodoroService.completeSession(userId);
        return ResponseEntity.ok(reward);
    }
}