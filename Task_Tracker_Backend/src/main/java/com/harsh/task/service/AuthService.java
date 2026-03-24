package com.harsh.task.service;

import com.harsh.task.domain.dto.AuthResponseDto;
import com.harsh.task.domain.dto.LoginRequestDto;
import com.harsh.task.domain.dto.RegisterRequestDto;
import com.harsh.task.entity.User;
import com.harsh.task.entity.UserRole;
import com.harsh.task.exception.InvalidRefreshTokenException;
import com.harsh.task.exception.ResourceNotFoundException;
import com.harsh.task.repository.UserRepository;
import com.harsh.task.security.AuthenticatedUser;
import com.harsh.task.security.JwtUtil;
import com.harsh.task.security.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @Value("${jwt.refresh.cookie.name}")
    private String refreshCookieName;

    // --- REGISTER ---
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request,
                                    HttpServletRequest httpRequest,
                                    HttpServletResponse httpResponse) {
        // Validate uniqueness
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalStateException(
                    "Username '" + request.username() + "' is already taken.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException(
                    "Email '" + request.email() + "' is already registered.");
        }

        // Create user with hashed password
        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(UserRole.USER)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getUsername());

        return issueTokensAndBuildResponse(user, httpRequest, httpResponse);
    }

    // --- LOGIN ---
    @Transactional
    public AuthResponseDto login(LoginRequestDto request,
                                 HttpServletRequest httpRequest,
                                 HttpServletResponse httpResponse) {
        // Find user by username or email
        User user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() ->
                        new InvalidRefreshTokenException("Invalid credentials"));

        // Verify password
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidRefreshTokenException("Invalid credentials");
        }

        log.info("User logged in: {}", user.getUsername());
        return issueTokensAndBuildResponse(user, httpRequest, httpResponse);
    }

    // --- REFRESH ---
    @Transactional
    public AuthResponseDto refresh(HttpServletRequest httpRequest,
                                   HttpServletResponse httpResponse) {
        // Extract refresh token from httpOnly cookie
        String rawRefreshToken = extractRefreshTokenFromCookie(httpRequest);

        if (rawRefreshToken == null) {
            throw new InvalidRefreshTokenException(
                    "No refresh token found. Please log in.");
        }

        // Validate and rotate
        var refreshToken = refreshTokenService
                .validateRefreshToken(rawRefreshToken);
        User user = refreshToken.getUser();

        String deviceInfo = httpRequest.getHeader("User-Agent");
        String newRawRefreshToken = refreshTokenService
                .rotateRefreshToken(refreshToken, deviceInfo);

        // Set new refresh token cookie
        setRefreshTokenCookie(httpResponse, newRawRefreshToken);

        // Generate new access token
        String accessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getUsername(), user.getRole().name()
        );

        return buildAuthResponse(accessToken, user);
    }

    // --- LOGOUT ---
    @Transactional
    public void logout(HttpServletRequest httpRequest,
                       HttpServletResponse httpResponse,
                       AuthenticatedUser authenticatedUser) {
        // Revoke all tokens for this user
        refreshTokenService.revokeAllUserTokens(authenticatedUser.getUserId());

        // Clear the cookie
        clearRefreshTokenCookie(httpResponse);

        log.info("User {} logged out", authenticatedUser.getUsername());
    }

    // --- HELPERS ---

    private AuthResponseDto issueTokensAndBuildResponse(
            User user,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String deviceInfo = httpRequest.getHeader("User-Agent");

        // Generate access token
        String accessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getUsername(), user.getRole().name()
        );

        // Generate refresh token and set cookie
        String rawRefreshToken = refreshTokenService
                .createRefreshToken(user, deviceInfo);
        setRefreshTokenCookie(httpResponse, rawRefreshToken);

        return buildAuthResponse(accessToken, user);
    }

    private AuthResponseDto buildAuthResponse(String accessToken, User user) {
        int xpToNextLevel = (user.getLevel() * 500) - user.getCurrentXp();

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .level(user.getLevel())
                .levelTitle(getLevelName(user.getLevel()))
                .currentXp(user.getCurrentXp())
                .totalXp(user.getTotalXp())
                .xpToNextLevel(xpToNextLevel)
                .gemBalance(user.getGemBalance())
                .currentDailyStreak(user.getCurrentDailyStreak())
                .longestDailyStreak(user.getLongestDailyStreak())
                .pomodoroFlowStreak(user.getPomodoroFlowStreak())
                .xpBoostActive(user.isXpBoostActive())
                .currentTheme(user.getProfileTheme())
                .build();
    }

    private void setRefreshTokenCookie(HttpServletResponse response,
                                       String rawToken) {
        Cookie cookie = new Cookie(refreshCookieName, rawToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set true in production with HTTPS
        cookie.setPath("/api/auth"); // Cookie only sent to auth endpoints
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days in seconds
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(refreshCookieName, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0); // Immediately expire
        response.addCookie(cookie);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        return Arrays.stream(request.getCookies())
                .filter(c -> refreshCookieName.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
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