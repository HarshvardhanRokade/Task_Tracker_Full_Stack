package com.harsh.task.seeder;

import com.harsh.task.repository.BadgeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@Order(1) // ✨ This forces it to run right away!
public class BadgeIconPatcher implements CommandLineRunner {

    private final BadgeRepository badgeRepository;

    public BadgeIconPatcher(BadgeRepository badgeRepository) {
        this.badgeRepository = badgeRepository;
    }

    @Override
    public void run(String... args) {
        System.out.println("⏳ Running Badge Icon Patcher...");

        Map<String, String> correctIcons = Map.ofEntries(
                Map.entry("LEVEL_2", "🎯"),
                Map.entry("LEVEL_5", "⚡"),
                Map.entry("LEVEL_10", "🔮"),
                Map.entry("LEVEL_20", "👑"),
                Map.entry("STREAK_7", "🔥"),
                Map.entry("STREAK_30", "🌙"),
                Map.entry("STREAK_100", "💯"),
                Map.entry("TASKS_1", "✅"),
                Map.entry("TASKS_10", "🗡️"),
                Map.entry("TASKS_50", "⚔️"),
                Map.entry("TASKS_100", "🏆"),
                Map.entry("POMODORO_1", "🍅"),
                Map.entry("POMODORO_10", "🧘"),
                Map.entry("POMODORO_50", "🎓"),
                Map.entry("FIRST_PURCHASE", "💎"),
                Map.entry("GEMS_500", "💰")
        );

        badgeRepository.findAll().forEach(badge -> {
            if (correctIcons.containsKey(badge.getBadgeKey())) {
                badge.setIcon(correctIcons.get(badge.getBadgeKey()));
                badgeRepository.save(badge);
            }
        });

        System.out.println("🏆🏆🏆 BADGE ICONS PATCHED SUCCESSFULLY! 🏆🏆🏆");
    }
}