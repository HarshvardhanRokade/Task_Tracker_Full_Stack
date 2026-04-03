package com.harsh.task.leaderboard;

import com.harsh.task.entity.Season;
import com.harsh.task.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeasonScheduler {

    private final SeasonService seasonService;
    private final SeasonRepository seasonRepository;

    // Runs daily at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void checkSeasonEnd() {
        seasonRepository.findByIsActiveTrue().ifPresent(season -> {
            if (!LocalDate.now().isAfter(season.getEndDate())) return;

            log.info("Season {} has ended. Processing...",
                    season.getSeasonNumber());
            seasonService.endSeasonAndStartNext();
        });
    }
}