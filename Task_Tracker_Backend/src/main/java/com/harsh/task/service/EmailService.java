package com.harsh.task.service;


import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;


@Service
public class EmailService {

   private  static  final Logger log = LoggerFactory.getLogger(EmailService.class);

   private final JavaMailSender mailSender;
   private final String fromEmail;

   public EmailService (JavaMailSender mailSender , @Value("${spring.mail.username}") String fromEmail){
       this.mailSender = mailSender;
       this.fromEmail = fromEmail;
   }

    public void sendRemainderEmail (String toEmail , String taskTitle , String taskDescription){

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("⏰ Task Reminder: " + taskTitle);

        String body = "This is a reminder for your Task" + taskTitle + "\n\n";
        if(taskDescription != null  &&  !taskDescription.isEmpty()){
            body += "Description: " + taskDescription + "\n";
        }
        body += "\n Time to get back to work!";

        message.setText(body);
        mailSender.send(message);
        log.info("✅ Reminder email sent successfully for task: {}", taskTitle);
    }
}
