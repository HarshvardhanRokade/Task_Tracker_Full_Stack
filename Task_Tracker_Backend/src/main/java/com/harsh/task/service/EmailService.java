package com.harsh.task.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.SendEmailRequest;
import com.resend.services.emails.model.SendEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${RESEND_API_KEY}")
    private String resendApiKey;

    public void sendReminderEmail(String toEmail, String taskTitle, String description) {
        Resend resend = new Resend(resendApiKey);

        // This prevents the word "null" from printing if the task has no description
        String safeDescription = (description != null && !description.trim().isEmpty())
                ? description
                : "No description provided.";

        SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                .from("Task Tracker <onboarding@resend.dev>") // Adds a clean sender name
                .to(toEmail)
                .subject("Task Reminder: " + taskTitle)
                .html("<p>This is a reminder for your task: <strong>" + taskTitle + "</strong></p>" +
                        "<p>Description: " + safeDescription + "</p>" +
                        "<p>Time to get back to work!</p>")
                .build();

        try {
            SendEmailResponse data = resend.emails().send(sendEmailRequest);
            log.info("✅ Reminder email sent successfully! ID: " + data.getId());
        } catch (ResendException e) {
            log.error("❌ Failed to send email via Resend: " + e.getMessage());
        }
    }
}