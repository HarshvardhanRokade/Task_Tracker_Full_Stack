package com.harsh.task.seeder;

import com.harsh.task.entity.User;
import com.harsh.task.repository.UserRepository;
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
    public void run(String... args){

        if(userRepository.count() > 0){
            log.info("Seeder skipped - users already present");
        }

        log.info("Running GamificationSeeder...");

        // User 1 — The Newbie
        // All gamification fields at zero/null. Tests first-ever-action paths.
        userRepository.save(User.builder()
                .username("newbie_user")
                .email("newbie@test.com")
                .password("hashed_password")
                .build()
        );

        // User 2 — The Level 49 Grinder
        // 100 XP away from Level 50. Tests multi-level XpEngine while loop.
        // Level 49 requires 49 * 500 = 24,500 XP to advance.
        userRepository.save(User.builder()
                .username("grinder_user")
                .email("grinder@test.com")
                .password("hashed_password")
                .level(49)
                .currentXp(24400)
                .totalXp(500000)
                .gemBalance(350)
                .build());


        // User 3 — The 100-Day Streaker
        // Tests tiered streak freeze pricing (200 gem tier) and freeze auto-activation.
        userRepository.save(User.builder()
                .username("streaker_user")
                .email("streaker@test.com")
                .password("hashed_password")
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
        // Last active yesterday at 11:59 PM.
        // Delta = ~24 hours. Expected: streak increments (Rule 3 success).
        userRepository.save(User.builder()
                .username("nightowl_grace")
                .email("nightowl_grace@test.com")
                .password("hashed_password")
                .currentDailyStreak(7)
                .longestDailyStreak(7)
                .lastActiveTimestamp(
                        LocalDateTime.now()
                                .minusDays(1)
                                .withHour(23)
                                .withMinute(59)
                                .withSecond(0)
                )
                .build());


        // User 4B — Night Owl Grace Failure
        // Last active two days ago at 11:00 AM.
        // Delta = ~47 hours. Expected: streak resets to 1 (Rule 4).
        userRepository.save(User.builder()
         .username("nightowl_break")
                .email("nightowl_break@test.com")
                .password("hashed_password")
                .currentDailyStreak(14)
                .longestDailyStreak(30)
                .lastActiveTimestamp(
                        LocalDateTime.now()
                                .minusDays(2)
                                .withHour(11)
                                .withMinute(0)
                                .withSecond(0)
                )
                .build());

        // User 4C — Same Day Repeat
        // Last active today at a fixed time.
        // Expected: streak unchanged (Rule 1).
        userRepository.save(User.builder()
                .username("sameday_user")
                .email("sameday@test.com")
                .password("hashed_password")
                .currentDailyStreak(5)
                .longestDailyStreak(5)
                .lastActiveTimestamp(LocalDateTime.now().withHour(9).withMinute(0))
                .build());


        // User 5 — Mid-Session User
        // session_deadline set to now + 15 minutes.
        // Tests real-time /complete while session is still valid.
        userRepository.save(User.builder()
                .username("midsession_user")
                .email("midsession@test.com")
                .password("hashed_password")
                .pomodoroFlowStreak(3)
                .sessionDeadline(LocalDateTime.now().plusMinutes(15))
                .build());


        // User 6 — Abandoned Session User
        // session_deadline set to now - 2 hours.
        // Tests Degraded Success path on /complete with expired deadline.
        userRepository.save(User.builder()
                .username("abandoned_user")
                .email("abandoned@test.com")
                .password("hashed_password")
                .pomodoroFlowStreak(2)
                .sessionDeadline(LocalDateTime.now().minusHours(2))
                .build());

        log.info("GamificationSeeder complete — 8 test users created.");
    }
}
