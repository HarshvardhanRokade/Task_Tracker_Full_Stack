package com.harsh.task.seeder;

import com.harsh.task.entity.User;
import com.harsh.task.repository.UserRepository;
import com.harsh.task.entity.UserRole; // Make sure this enum exists!
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class GamificationSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {

        // 1. Check if DB is already seeded
        if (userRepository.count() > 0) {
            log.info("✅ Seeder skipped - users already present. Database is ready.");
            return;
        }

        log.info("🚀 Running GamificationSeeder: Creating fresh test users...");

        // User 1 — The Newbie
        userRepository.save(User.builder()
                .username("newbie_user")
                .email("newbie@test.com")
                .password("hashed_password")
                .role(UserRole.USER)
                .currentXp(0)
                .level(1)
                .gemBalance(0)
                .build()
        );

        // User 2 — The Level 49 Grinder
        userRepository.save(User.builder()
                .username("grinder_user")
                .email("grinder@test.com")
                .password("hashed_password")
                .role(UserRole.USER)
                .level(49)
                .currentXp(24400)
                .totalXp(500000)
                .gemBalance(350)
                .build());

        // User 3 — The 100-Day Streaker
        userRepository.save(User.builder()
                .username("streaker_user")
                .email("streaker@test.com")
                .password("hashed_password")
                .role(UserRole.USER)
                .level(15)
                .currentXp(3200)
                .totalXp(85000)
                .gemBalance(420)
                .streakFreezesOwned(1)
                .currentDailyStreak(100)
                .longestDailyStreak(100)
                .lastActiveTimestamp(LocalDateTime.now().minusHours(2))
                .build());

        // User 4A — Night Owl Grace Success
        userRepository.save(User.builder()
                .username("nightowl_grace")
                .email("nightowl_grace@test.com")
                .password("hashed_password")
                .role(UserRole.USER)
                .currentDailyStreak(7)
                .longestDailyStreak(7)
                .lastActiveTimestamp(LocalDateTime.now().minusDays(1).withHour(23).withMinute(59))
                .build());

        // User 4B — Night Owl Grace Failure
        userRepository.save(User.builder()
                .username("nightowl_break")
                .email("nightowl_break@test.com")
                .password("hashed_password")
                .role(UserRole.USER)
                .currentDailyStreak(14)
                .longestDailyStreak(30)
                .lastActiveTimestamp(LocalDateTime.now().minusDays(2).withHour(11).withMinute(0))
                .build());

        // User 4C — Same Day Repeat
        userRepository.save(User.builder()
                .username("sameday_user")
                .email("sameday@test.com")
                .password("hashed_password")
                .role(UserRole.USER)
                .currentDailyStreak(5)
                .longestDailyStreak(5)
                .lastActiveTimestamp(LocalDateTime.now().withHour(9).withMinute(0))
                .build());

        // User 5 — Mid-Session User
        userRepository.save(User.builder()
                .username("midsession_user")
                .email("midsession@test.com")
                .password("hashed_password")
                .role(UserRole.USER)
                .pomodoroFlowStreak(3)
                .sessionDeadline(LocalDateTime.now().plusMinutes(15))
                .build());

        // User 6 — Abandoned Session User
        userRepository.save(User.builder()
                .username("abandoned_user")
                .email("abandoned@test.com")
                .password("hashed_password")
                .role(UserRole.USER)
                .pomodoroFlowStreak(2)
                .sessionDeadline(LocalDateTime.now().minusHours(2))
                .build());

        log.info("✨ GamificationSeeder complete — 8 test users created.");
    }
}