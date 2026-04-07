package com.harsh.task.seeder;

import com.harsh.task.entity.User;
import com.harsh.task.repository.UserRepository;
import com.harsh.task.entity.UserRole; // Make sure this enum exists!
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class GamificationSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                .password(passwordEncoder.encode("Password123!"))
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
                .password(passwordEncoder.encode("Password123!"))
                .role(UserRole.USER)
                .level(49)
                .currentXp(24400)
                .totalXp(500000)
                .gemBalance(350)
                .build());

        log.info("✨ GamificationSeeder complete — 8 test users created.");
    }
}