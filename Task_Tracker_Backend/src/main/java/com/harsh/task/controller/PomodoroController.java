package com.harsh.task.controller;

import com.harsh.task.domain.dto.PomodoroRewardDto;
import com.harsh.task.security.AuthenticatedUser;
import com.harsh.task.service.PomodoroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroService pomodoroService;

    @PostMapping("/start")
    public ResponseEntity<Void> startSession(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        pomodoroService.startSession(currentUser.getUserId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/pause")
    public ResponseEntity<Void> pauseSession(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        pomodoroService.pauseSession(currentUser.getUserId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resume")
    public ResponseEntity<Void> resumeSession(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        pomodoroService.resumeSession(currentUser.getUserId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/complete")
    public ResponseEntity<PomodoroRewardDto> completeSession(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(
                pomodoroService.completeSession(currentUser.getUserId())
        );
    }

    @PostMapping("/forfeit")
    public ResponseEntity<Void> forfeitSession(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        pomodoroService.forfeitSession(currentUser.getUserId());
        return ResponseEntity.ok().build();
    }
}