package com.harsh.task.service;

import com.harsh.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReminderMarkingService {

    private final TaskRepository taskRepository;

    @Transactional
    public void markAsSent(UUID taskId) {
        taskRepository.findById(taskId).ifPresent(task -> {
            task.setReminderSent(true);
            taskRepository.save(task);
        });
    }
}