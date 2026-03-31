package com.harsh.task.leaderboard;

import com.harsh.task.badge.BadgeService;
import com.harsh.task.domain.dto.*;
import com.harsh.task.entity.*;
import com.harsh.task.exception.ResourceNotFoundException;
import com.harsh.task.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicProfileService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final BadgeService badgeService;
    private final WeeklyScoreRepository weeklyScoreRepository;
    private final WeeklyScoreCalculator calculator;
    private final TaskRepository taskRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @Transactional(readOnly = true)
    public PublicProfileDto getProfile(String username,
                                       Long currentUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + username));

        // Current week score and rank
        LocalDate weekStart =
                WeeklyScoreCalculator.getCurrentWeekStart();

        WeeklyScore weekScore = weeklyScoreRepository
                .findByUserIdAndWeekStartDate(user.getId(), weekStart)
                .orElse(WeeklyScore.builder()
                        .totalScore(0).build());

        // Rank — count users with higher score this week
        List<WeeklyScore> topScores = weeklyScoreRepository
                .findTopByWeek(weekStart, PageRequest.of(0, 100));

        int weekRank = (int) topScores.stream()
                .filter(ws -> ws.getTotalScore() > weekScore.getTotalScore())
                .count() + 1;

        // Earned badges
        List<UserBadgeDto> earnedBadges = badgeService
                .getUserBadges(user.getId())
                .stream()
                .map(ub -> UserBadgeDto.builder()
                        .badgeKey(ub.getBadge().getBadgeKey())
                        .name(ub.getBadge().getName())
                        .description(ub.getBadge().getDescription())
                        .icon(ub.getBadge().getIcon())
                        .category(ub.getBadge().getCategory())
                        .earnedAt(ub.getEarnedAt().format(DATE_FMT))
                        .build())
                .toList();

        // Locked badges — all badges the user has NOT earned
        List<String> earnedKeys = earnedBadges.stream()
                .map(UserBadgeDto::getBadgeKey)
                .toList();

        List<LockedBadgeDto> lockedBadges = badgeRepository.findAll()
                .stream()
                .filter(b -> !earnedKeys.contains(b.getBadgeKey()))
                .map(b -> LockedBadgeDto.builder()
                        .badgeKey(b.getBadgeKey())
                        .name(b.getName())
                        .description(b.getDescription())
                        .icon(b.getIcon())
                        .category(b.getCategory())
                        .requirementValue(b.getRequirementValue())
                        .build())
                .toList();

        // Score history — last 8 weeks
        List<WeeklyScoreHistoryDto> scoreHistory =
                weeklyScoreRepository.findByUserIdOrderByWeekDesc(
                                user.getId(), PageRequest.of(0, 8))
                        .stream()
                        .map(ws -> WeeklyScoreHistoryDto.builder()
                                .weekLabel(ws.getWeekStartDate().format(
                                        DateTimeFormatter.ofPattern("MMM dd")))
                                .totalScore(ws.getTotalScore())
                                .taskPoints(ws.getTaskPoints())
                                .pomodoroPoints(ws.getPomodoroPoints())
                                .consistencyPoints(ws.getConsistencyPoints())
                                .daysActive(ws.getDaysActive())
                                .build())
                        .collect(Collectors.toList())
                ;

        // Reverse to show oldest to newest for chart
        java.util.Collections.reverse(scoreHistory);

        // Stats
        long totalTasks = taskRepository
                .countByUserIdAndStatus(user.getId(), TaskStatus.COMPLETED);

        long totalPomodoros = pomodoroSessionRepository
                .countByUserId(user.getId());

        Integer bestFlowStreak = pomodoroSessionRepository
                .findBestFlowStreak(user.getId());

        // Top tags
        java.time.Instant allTime =
                java.time.Instant.ofEpochMilli(0);
        List<Object[]> tagRaw = taskRepository
                .countTopTags(user.getId(), allTime,
                        PageRequest.of(0, 5));

        List<TaskAnalyticsDto.TagCountDto> topTags = tagRaw.stream()
                .map(row -> TaskAnalyticsDto.TagCountDto.builder()
                        .tagName((String) row[0])
                        .count((Long) row[1])
                        .build())
                .toList();

        return PublicProfileDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .level(user.getLevel())
                .levelTitle(getLevelName(user.getLevel()))
                .memberSince(user.getCreatedAt().format(DATE_FMT))
                .totalXp(user.getTotalXp())
                .currentDailyStreak(user.getCurrentDailyStreak())
                .longestDailyStreak(user.getLongestDailyStreak())
                .totalTasksCompleted(totalTasks)
                .totalPomodoroSessions(totalPomodoros)
                .bestFlowStreak(bestFlowStreak != null
                        ? bestFlowStreak : 0)
                .currentWeekScore(weekScore.getTotalScore())
                .currentWeekRank(weekRank)
                .earnedBadges(earnedBadges)
                .lockedBadges(lockedBadges)
                .topTags(topTags)
                .scoreHistory(scoreHistory)
                .isCurrentUser(currentUserId != null && user.getId().equals(currentUserId))
                .build();
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