package com.harsh.task.service;

import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskStatus;
import com.harsh.task.repository.TaskRepository;
import com.harsh.task.service.EmailService;
import com.harsh.task.service.ReminderMarkingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {
    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    private final TaskRepository taskRepository;
    private final EmailService emailService;
    private final ReminderMarkingService markingService;

    @Scheduled(cron = "0 * * * * *") // Every minute
    public void checkAndSendReminders() {
        LocalDateTime now = LocalDateTime.now();

        // Safety valve: Only process 100 reminders per minute
        List<Task> pendingTasks = taskRepository.findPendingReminders(
                now, TaskStatus.OPEN, PageRequest.of(0, 100));

        if (pendingTasks.isEmpty()) return;

        log.info("🔍 Processing {} task reminders...", pendingTasks.size());

        for (Task task : pendingTasks) {
            try {
                emailService.sendReminderEmail(
                        task.getUser().getEmail(),
                        task.getTitle(),
                        task.getDescription()
                );

                markingService.markAsSent(task.getId());

            } catch (Exception e) {
                log.error("❌ Failed to process reminder for Task {}: {}", task.getId(), e.getMessage());
            }
        }
    }
}