package com.harsh.task.service;

import com.harsh.task.entity.Task;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class CalendarService {

    public String generateIcsFile(Task task){
        LocalDateTime startTime;

        if(task.getReminderDateTime() != null){
            startTime = task.getReminderDateTime();
        }
        else if(task.getDueDate() != null){
            startTime = task.getDueDate().atTime(9,0);
        }
        else {
            startTime = LocalDateTime.now().plusHours(1);
        }

        LocalDateTime endTime = startTime.plusHours(1);

        String dtStart = formatToUtcIcs(startTime);
        String dtEnd = formatToUtcIcs(endTime);
        String dtStamp = formatToUtcIcs(LocalDateTime.now());

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//Harsh Task Tracker//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");

        ics.append("BEGIN:VEVENT\r\n");
        ics.append("UID:").append(task.getId()).append("\r\n");
        ics.append("DTSTAMP:").append(dtStamp).append("\r\n");
        ics.append("DTSTART:").append(dtStart).append("\r\n");
        ics.append("DTEND:").append(dtEnd).append("\r\n");
        ics.append("SUMMARY:").append(task.getTitle()).append("\r\n");

        if (task.getDescription() != null && !task.getDescription().isEmpty()) {
            // Calendars break if there are raw line breaks in the description
            String safeDesc = task.getDescription().replace("\n", "\\n").replace("\r", "");
            ics.append("DESCRIPTION:").append(safeDesc).append("\r\n");
        }

        ics.append("STATUS:CONFIRMED\r\n");
        ics.append("END:VEVENT\r\n");
        ics.append("END:VCALENDAR\r\n");


        return ics.toString();
    }

    private String formatToUtcIcs(LocalDateTime dateTime){
        return dateTime.atZone(ZoneId.systemDefault())
                .withZoneSameInstant(ZoneId.of("UTC"))
                .format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'"));
    }
}
