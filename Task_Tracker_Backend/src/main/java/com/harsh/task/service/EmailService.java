package com.harsh.task.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value; // Use this one!
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    public void sendReminderEmail(String toEmail, String taskTitle, String taskDescription) {
        if (toEmail == null || toEmail.isBlank()) {
            log.error("❌ Cannot send reminder — recipient email is missing for task: {}", taskTitle);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("⏰ Task Reminder: " + taskTitle);

        String body = "This is a reminder for your task: " + taskTitle + "\n\n" +
                ((taskDescription != null && !taskDescription.isEmpty()) ? "Description: " + taskDescription + "\n\n" : "") +
                "Time to get back to work!";

        message.setText(body);
        mailSender.send(message);
        log.info("✅ Reminder email sent to {} for task: {}", toEmail, taskTitle);
    }
}