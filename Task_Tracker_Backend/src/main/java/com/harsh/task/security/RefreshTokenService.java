package com.harsh.task.security;

import com.harsh.task.entity.RefreshToken;
import com.harsh.task.entity.User;
import com.harsh.task.exception.InvalidRefreshTokenException;
import com.harsh.task.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh.expiry.days}")
    private long refreshExpiryDays;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // --- Generate a new refresh token for a user ---
    @Transactional
    public String createRefreshToken(User user, String deviceInfo) {
        // Generate cryptographically secure random token
        byte[] tokenBytes = new byte[32]; // 256 bits
        SECURE_RANDOM.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);

        // Hash it before storing
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusDays(refreshExpiryDays))
                .deviceInfo(deviceInfo)
                .build();

        refreshTokenRepository.save(refreshToken);

        log.info("Refresh token created for user {}", user.getId());

        // Return raw token — this is what goes in the cookie
        // The hash stays in the database
        return rawToken;
    }

    // --- Validate refresh token and return the entity ---
    @Transactional
    public RefreshToken validateRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidRefreshTokenException(
                        "Refresh token not found"
                ));

        // Check if revoked — this is the reuse detection trigger
        if (refreshToken.isRevoked()) {
            log.warn("SECURITY: Revoked refresh token reuse detected " +
                            "for user {}. Revoking ALL tokens.",
                    refreshToken.getUser().getId());

            // Revoke ALL tokens for this user — potential compromise
            refreshTokenRepository.revokeAllByUserId(
                    refreshToken.getUser().getId()
            );

            throw new InvalidRefreshTokenException(
                    "Refresh token reuse detected. Please log in again."
            );
        }

        // Check expiry
        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidRefreshTokenException("Refresh token expired");
        }

        return refreshToken;
    }

    // --- Rotate: revoke old token, issue new one ---
    @Transactional
    public String rotateRefreshToken(RefreshToken oldToken, String deviceInfo) {
        // Revoke the old token
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        // Issue a new one
        return createRefreshToken(oldToken.getUser(), deviceInfo);
    }

    // --- Revoke all tokens for a user (logout all devices) ---
    @Transactional
    public void revokeAllUserTokens(Long userId) {
        int count = refreshTokenRepository.revokeAllByUserId(userId);
        log.info("Revoked {} refresh tokens for user {}", count, userId);
    }

    // --- SHA-256 hash of the raw token ---
    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(
                    rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8)
            );
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}