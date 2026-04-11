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

        // 1. Create a beautiful, styled HTML template using Java Text Blocks
        String emailTemplate = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    
                    <div style="background-color: #111827; padding: 30px; text-align: center;">
                        <h1 style="color: #2ecc71; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Deep Work Protocol</h1>
                    </div>
                    
                    <div style="padding: 40px 30px;">
                        <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Time to focus! 🎯</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 25px;">
                            This is your automated reminder to get back into the flow state and crush your goals.
                        </p>
                        
                        <div style="background-color: #f3f4f6; border-left: 4px solid #2ecc71; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px;">{{TASK_TITLE}}</h3>
                            <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.5;">{{TASK_DESC}}</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="https://task-tracker-full-stack-sigma.vercel.app" style="background-color: #2ecc71; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Start Pomodoro Session</a>
                        </div>
                    </div>
                    
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                            Sent securely from <a href="https://tasktracker.quest" style="color: #2ecc71; text-decoration: none;">tasktracker.quest</a><br/>
                            Keep up your focus streak! ⚡
                        </p>
                    </div>
                    
                </div>
            </div>
            """;

        // 2. Inject your variables safely into the template
        String finalHtmlContent = emailTemplate
                .replace("{{TASK_TITLE}}", taskTitle)
                .replace("{{TASK_DESC}}", safeDescription);

        // 3. Build the Resend request
        SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                .from("Task Tracker <admin@tasktracker.quest>")
                .to(toEmail)
                .subject("🎯 Action Required: " + taskTitle)
                .html(finalHtmlContent)
                .build();

        try {
            SendEmailResponse data = resend.emails().send(sendEmailRequest);
            log.info("✅ Reminder email sent successfully! ID: " + data.getId());
        } catch (ResendException e) {
            log.error("❌ Failed to send email via Resend: " + e.getMessage());
        }
    }
}