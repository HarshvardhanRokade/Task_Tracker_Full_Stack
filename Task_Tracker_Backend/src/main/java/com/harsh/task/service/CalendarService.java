package com.harsh.task.service;

import com.harsh.task.entity.Task;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class CalendarService {

    @Value("${app.timezone:UTC}")
    private String appTimezone;

    public String generateIcsFile(Task task) {
        LocalDateTime startTime = (task.getReminderDateTime() != null) ? task.getReminderDateTime()
                : (task.getDueDate() != null) ? task.getDueDate().atTime(9, 0)
                : LocalDateTime.now().plusHours(1);

        LocalDateTime endTime = startTime.plusHours(1);

        String dtStart = formatToUtcIcs(startTime);
        String dtEnd = formatToUtcIcs(endTime);
        String dtStamp = formatToUtcIcs(LocalDateTime.now());

        StringBuilder ics = new StringBuilder();
        // Inside generateIcsFile
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n"); // Restored
        ics.append("PRODID:-//Harsh Task Tracker//EN\r\n");

        ics.append("BEGIN:VEVENT\r\n");
        ics.append("UID:").append(task.getId()).append("\r\n");
        ics.append("DTSTAMP:").append(dtStamp).append("\r\n");
        ics.append(foldLine("DTSTART:" + dtStart)).append("\r\n");
        ics.append(foldLine("DTEND:" + dtEnd)).append("\r\n");
        ics.append(foldLine("SUMMARY:" + task.getTitle())).append("\r\n");

        if (task.getDescription() != null && !task.getDescription().isEmpty()) {
            String safeDesc = task.getDescription().replace("\n", "\\n").replace("\r", "");
            ics.append(foldLine("DESCRIPTION:" + safeDesc)).append("\r\n");
        }

        // --- NEW: Add Alarm (15 mins before) ---
        ics.append("BEGIN:VALARM\r\n");
        ics.append("TRIGGER:-PT15M\r\n");
        ics.append("ACTION:DISPLAY\r\n");
        ics.append("DESCRIPTION:Reminder\r\n");
        ics.append("END:VALARM\r\n");

        ics.append("STATUS:CONFIRMED\r\n");
        ics.append("END:VEVENT\r\n");
        ics.append("END:VCALENDAR\r\n");

        return ics.toString();
    }

    private String foldLine(String line) {
        if (line.length() <= 75) return line;
        StringBuilder folded = new StringBuilder();
        folded.append(line, 0, 75);
        for (int i = 75; i < line.length(); i += 74) {
            folded.append("\r\n ");
            folded.append(line, i, Math.min(i + 74, line.length()));
        }
        return folded.toString();
    }

    private String formatToUtcIcs(LocalDateTime dateTime) {
        return dateTime.atZone(ZoneId.of(appTimezone))
                .withZoneSameInstant(ZoneId.of("UTC"))
                .format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'"));
    }
}