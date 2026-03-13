package com.harsh.task.service;

import com.harsh.task.domain.dto.PomodoroRewardDto;

public interface PomodoroService {
    void startSession(Long userId);
    void pauseSession(Long userId);
    void resumeSession(Long userId);
    PomodoroRewardDto completeSession(Long userId);
}