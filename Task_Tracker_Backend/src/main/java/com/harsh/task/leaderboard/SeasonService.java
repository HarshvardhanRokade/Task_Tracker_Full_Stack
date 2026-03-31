package com.harsh.task.leaderboard;

import com.harsh.task.badge.BadgeContext;
import com.harsh.task.badge.BadgeEvent;
import com.harsh.task.badge.BadgeService;
import com.harsh.task.domain.dto.SeasonEntryDto;
import com.harsh.task.domain.dto.SeasonLeaderboardDto;
import com.harsh.task.entity.*;
import com.harsh.task.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeasonService {

    private final SeasonRepository seasonRepository;
    private final SeasonResultRepository seasonResultRepository;
    private final WeeklyScoreRepository weeklyScoreRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @Transactional(readOnly = true)
    public SeasonLeaderboardDto getSeasonLeaderboard(Long currentUserId) {
        Season season = seasonRepository.findByIsActiveTrue()
                .orElseThrow(() ->
                        new IllegalStateException("No active season found"));

        List<Object[]> scores = weeklyScoreRepository.findSeasonScores(
                season.getStartDate(),
                season.getEndDate(),
                PageRequest.of(0, 10)
        );

        AtomicInteger rank = new AtomicInteger(1);

        List<SeasonEntryDto> entries = scores.stream()
                .map(row -> {
                    Long userId = (Long) row[0];
                    int score   = ((Number) row[1]).intValue();

                    User user = userRepository.findById(userId)
                            .orElse(null);
                    if (user == null) return null;

                    return SeasonEntryDto.builder()
                            .rank(rank.getAndIncrement())
                            .userId(userId)
                            .username(user.getUsername())
                            .level(user.getLevel())
                            .levelTitle(getLevelName(user.getLevel()))
                            .totalSeasonScore(score)
                            .isCurrentUser(userId.equals(currentUserId))
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        return SeasonLeaderboardDto.builder()
                .seasonNumber(season.getSeasonNumber())
                .seasonName(season.getName())
                .startDate(season.getStartDate().format(DATE_FMT))
                .endDate(season.getEndDate().format(DATE_FMT))
                .isActive(season.isActive())
                .entries(entries)
                .build();
    }

    @Transactional
    public void endSeasonAndStartNext() {
        Season current = seasonRepository.findByIsActiveTrue()
                .orElseThrow(() ->
                        new IllegalStateException("No active season to end"));

        log.info("Ending Season {}: {}",
                current.getSeasonNumber(), current.getName());

        // Calculate final rankings
        List<Object[]> finalScores = weeklyScoreRepository.findSeasonScores(
                current.getStartDate(),
                current.getEndDate(),
                PageRequest.of(0, Integer.MAX_VALUE)
        );

        // Save season results and award badges to top 3
        AtomicInteger rank = new AtomicInteger(1);
        finalScores.forEach(row -> {
            Long userId   = (Long) row[0];
            int score     = ((Number) row[1]).intValue();
            int finalRank = rank.getAndIncrement();

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return;

            // Save result
            seasonResultRepository.save(SeasonResult.builder()
                    .season(current)
                    .user(user)
                    .finalRank(finalRank)
                    .totalSeasonScore(score)
                    .build());

            // Award badge to top 3
            if (finalRank <= 3) {
                String badgeKey = "SEASON_" +
                        current.getSeasonNumber() + "_" +
                        (finalRank == 1 ? "GOLD" :
                                finalRank == 2 ? "SILVER" : "BRONZE");

                badgeService.checkAndAward(
                        BadgeContext.builder()
                                .user(user)
                                .event(BadgeEvent.SEASON_END)
                                .seasonRank(finalRank)
                                .seasonNumber(current.getSeasonNumber())
                                .build()
                );

                log.info("Awarded {} badge to user {}",
                        badgeKey, user.getUsername());
            }
        });

        // Mark current season inactive
        current.setActive(false);
        seasonRepository.save(current);

        // Create next season
        int nextNumber = current.getSeasonNumber() + 1;
        LocalDate nextStart = current.getEndDate().plusDays(1);
        LocalDate nextEnd   = nextStart.plusDays(30);

        Season nextSeason = Season.builder()
                .seasonNumber(nextNumber)
                .name("Season " + nextNumber + " — Rising")
                .startDate(nextStart)
                .endDate(nextEnd)
                .isActive(true)
                .build();

        seasonRepository.save(nextSeason);

        // Add seasonal badges for next season
        addSeasonBadges(nextNumber);

        log.info("Season {} started: {} to {}",
                nextNumber, nextStart, nextEnd);
    }

    private void addSeasonBadges(int seasonNumber) {
        // BadgeService handles this via a direct repository call
        // Badges are created when needed
        log.info("Season {} badges will be created on first award",
                seasonNumber);
    }

    private String getLevelName(int level) {
        if (level >= 50) return "Transcendent Planner";
        if (level >= 30) return "Legendary Focuser";
        if (level >= 20) return "Deep Work Champion";
        if (level >= 15) return "Productivity Sage";
        if (level >= 10) return "Flow Master";
        if (level >= 8)  return "Flow Initiate";
        if (level >= 5)  return "Dedicated Grinder";
        if (level >= 3)  return "Focus Seeker";
        if (level >= 2)  return "Task Apprentice";
        return "Novice Planner";
    }
}