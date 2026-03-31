package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PublicProfileDto {
    // Identity
    private Long userId;
    private String username;
    private int level;
    private String levelTitle;
    private String memberSince;
    private boolean isCurrentUser;

    // Stats
    private int totalXp;
    private int currentDailyStreak;
    private int longestDailyStreak;
    private long totalTasksCompleted;
    private long totalPomodoroSessions;
    private int bestFlowStreak;

    // Current week
    private int currentWeekScore;
    private int currentWeekRank;

    // Badges
    private List<UserBadgeDto> earnedBadges;
    private List<LockedBadgeDto> lockedBadges;

    // Top tags
    private List<TaskAnalyticsDto.TagCountDto> topTags;

    // Score history (last 8 weeks)
    private List<WeeklyScoreHistoryDto> scoreHistory;
}