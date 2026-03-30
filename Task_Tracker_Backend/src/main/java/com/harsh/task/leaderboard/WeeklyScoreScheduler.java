package com.harsh.task.leaderboard;

import com.harsh.task.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyScoreScheduler {

    private final UserRepository userRepository;
    private final WeeklyScoreCalculator calculator;

    // Run nightly at 11:30 PM
    @Scheduled(cron = "0 30 23 * * *")
    public void calculateNightlyScores() {
        LocalDate weekStart = WeeklyScoreCalculator.getCurrentWeekStart();
        log.info("Nightly score calculation starting for week {}",
                weekStart);

        userRepository.findAll().forEach(user -> {
            try {
                calculator.getOrCalculate(user, weekStart);
            } catch (Exception e) {
                log.error("Score calculation failed for user {}: {}",
                        user.getId(), e.getMessage());
            }
        });

        log.info("Nightly score calculation complete");
    }
}