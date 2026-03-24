package com.harsh.task.controller;

import com.harsh.task.domain.dto.AuthResponseDto;
import com.harsh.task.domain.dto.LoginRequestDto;
import com.harsh.task.domain.dto.RegisterRequestDto;
import com.harsh.task.security.AuthenticatedUser;
import com.harsh.task.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(
            @Valid @RequestBody RegisterRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        AuthResponseDto response = authService.register(
                request, httpRequest, httpResponse
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        return ResponseEntity.ok(
                authService.login(request, httpRequest, httpResponse)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        return ResponseEntity.ok(
                authService.refresh(httpRequest, httpResponse)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {

        authService.logout(httpRequest, httpResponse, authenticatedUser);
        return ResponseEntity.noContent().build();
    }
}