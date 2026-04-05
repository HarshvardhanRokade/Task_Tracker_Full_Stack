package com.harsh.task.seeder;

import com.harsh.task.entity.Badge;
import com.harsh.task.repository.BadgeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@Order(1)
public class BadgeIconPatcher implements CommandLineRunner {

    private final BadgeRepository badgeRepository;

    public BadgeIconPatcher(BadgeRepository badgeRepository) {
        this.badgeRepository = badgeRepository;
    }

    private static final Map<String, String> CORRECT_ICONS =
            Map.ofEntries(
                    Map.entry("LEVEL_2",         "🎯"),
                    Map.entry("LEVEL_5",         "⚡"),
                    Map.entry("LEVEL_10",        "🔮"),
                    Map.entry("LEVEL_20",        "👑"),
                    Map.entry("STREAK_7",        "🔥"),
                    Map.entry("STREAK_30",       "🌙"),
                    Map.entry("STREAK_100",      "💯"),
                    Map.entry("TASKS_1",         "✅"),
                    Map.entry("TASKS_10",        "🗡️"),
                    Map.entry("TASKS_50",        "⚔️"),
                    Map.entry("TASKS_100",       "🏆"),
                    Map.entry("POMODORO_1",      "🍅"),
                    Map.entry("POMODORO_10",     "🧘"),
                    Map.entry("POMODORO_50",     "🎓"),
                    Map.entry("FIRST_PURCHASE",  "💎"),
                    Map.entry("GEMS_500",        "💰"),
                    Map.entry("SEASON_1_GOLD",   "🏆"),
                    Map.entry("SEASON_1_SILVER", "🥈"),
                    Map.entry("SEASON_1_BRONZE", "🥉")
            );

    @Override
    public void run(String... args) {
        log.info("Patching badge icons...");

        // Single SELECT — fetch all badges at once
        List<Badge> badges = badgeRepository.findAll();

        // Update icons in memory — no database calls in the loop
        List<Badge> toUpdate = badges.stream()
                .filter(b -> CORRECT_ICONS.containsKey(b.getBadgeKey()))
                .peek(b -> b.setIcon(CORRECT_ICONS.get(b.getBadgeKey())))
                .collect(Collectors.toList());

        // Single batch UPDATE — one call instead of 19
        badgeRepository.saveAll(toUpdate);

        log.info("Badge icon patch complete. {} badges updated.",
                toUpdate.size());
    }
}