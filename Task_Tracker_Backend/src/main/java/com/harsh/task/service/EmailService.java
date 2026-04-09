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

    // Get this from Railway variables!
    @Value("${RESEND_API_KEY}")
    private String resendApiKey;

    public void sendReminderEmail(String toEmail, String taskTitle, String description) {
        Resend resend = new Resend(resendApiKey);

        SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                .from("onboarding@resend.dev") // Must be this exact address during testing
                .to(toEmail)
                .subject("Reminder: " + taskTitle)
                .html("<p>Don't forget to complete: <strong>" + taskTitle + "</strong></p><p>" + description + "</p>")
                .build();

        try {
            SendEmailResponse data = resend.emails().send(sendEmailRequest);
            log.info("✅ Reminder email sent successfully! ID: " + data.getId());
        } catch (ResendException e) {
            log.error("❌ Failed to send email via Resend: " + e.getMessage());
        }
    }
}