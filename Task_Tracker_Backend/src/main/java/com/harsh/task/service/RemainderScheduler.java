package com.harsh.task.service;

import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskStatus;
import com.harsh.task.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class RemainderScheduler {

    private static final Logger log = LoggerFactory.getLogger(RemainderScheduler.class);

    private final TaskRepository taskRepository;
    private final EmailService emailService;
    private final String recipientEmail;

    public RemainderScheduler(
            TaskRepository taskRepository,
            EmailService emailService,
            @Value("${spring.notification.recipient}") String recipientEmail
    ){
        this.taskRepository = taskRepository;
        this.emailService = emailService;
        this.recipientEmail = recipientEmail;
    }


    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void checkAndSendReminders(){

        LocalDateTime now = LocalDateTime.now();

        List<Task> pendingReminders = taskRepository
                .findByReminderDateTimeLessThanEqualAndReminderSentFalseAndStatus(now , TaskStatus.OPEN);


        if (!pendingReminders.isEmpty()) {
            log.info("🔍 Found {} open tasks needing reminders at {}", pendingReminders.size(), now);
        }

        for(Task task : pendingReminders){
            try {
                emailService.sendRemainderEmail(recipientEmail , task.getTitle() , task.getDescription());
                task.setReminderSent(true);
                taskRepository.save(task);
                log.info("✅ Reminder email sent successfully for task ID: {}", task.getId());
            }catch (Exception e){
                log.error("❌ Failed to send email for task ID: {}. Will retry on next cycle. Error: {}", task.getId(), e.getMessage());
            }
        }

    }
}
