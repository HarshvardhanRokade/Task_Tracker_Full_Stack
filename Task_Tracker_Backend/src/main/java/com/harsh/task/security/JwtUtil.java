package com.harsh.task.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey accessTokenKey;
    private final long accessTokenExpiryMs;

    public JwtUtil(
            @Value("${jwt.access.secret}") String accessSecret,
            @Value("${jwt.access.expiry.minutes}") long accessExpiryMinutes) {

        this.accessTokenKey = Keys.hmacShaKeyFor(
                accessSecret.getBytes(StandardCharsets.UTF_8)
        );
        this.accessTokenExpiryMs = accessExpiryMinutes * 60 * 1000;
    }

    // --- Generate Access Token ---
    public String generateAccessToken(Long userId, String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiryMs);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(accessTokenKey)
                .compact();
    }

    // --- Validate and Parse Token ---
    public Claims validateAndExtractClaims(String token) {
        return Jwts.parser()
                .verifyWith(accessTokenKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // --- Extract userId from token ---
    public Long extractUserId(String token) {
        return Long.parseLong(
                validateAndExtractClaims(token).getSubject()
        );
    }

    // --- Extract username from token ---
    public String extractUsername(String token) {
        return validateAndExtractClaims(token).get("username", String.class);
    }

    // --- Check if token is expired without throwing ---
    public boolean isTokenValid(String token) {
        try {
            validateAndExtractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}