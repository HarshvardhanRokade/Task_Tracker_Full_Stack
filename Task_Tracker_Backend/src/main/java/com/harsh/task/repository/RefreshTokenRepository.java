package com.harsh.task.repository;

import com.harsh.task.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    // Find by hash for validation on every refresh attempt
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // Revoke all tokens for a user — used on logout-all and reuse detection
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true " +
            "WHERE rt.user.id = :userId AND rt.revoked = false")
    int revokeAllByUserId(@Param("userId") Long userId);

    // Count active tokens per user — useful for limiting concurrent sessions
    @Query("SELECT COUNT(rt) FROM RefreshToken rt " +
            "WHERE rt.user.id = :userId " +
            "AND rt.revoked = false " +
            "AND rt.expiresAt > :now")
    long countActiveTokensByUserId(
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now
    );

    // Cleanup query for scheduled job — finds expired tokens
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
}