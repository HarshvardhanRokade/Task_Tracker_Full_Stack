package com.harsh.task.controller;

import com.harsh.task.domain.dto.PurchaseRequestDto;
import com.harsh.task.domain.dto.PurchaseResultDto;
import com.harsh.task.domain.dto.UserInventoryDto;
import com.harsh.task.security.AuthenticatedUser;
import com.harsh.task.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping("/inventory")
    public ResponseEntity<UserInventoryDto> getInventory(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(
                storeService.getInventory(currentUser.getUserId())
        );
    }

    @PostMapping("/purchase")
    public ResponseEntity<PurchaseResultDto> purchaseItem(
            @Valid @RequestBody PurchaseRequestDto request,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(
                storeService.purchaseItem(currentUser.getUserId(), request)
        );
    }

    @PostMapping("/equip-theme")
    public ResponseEntity<PurchaseResultDto> equipTheme(
            @RequestParam String themeName,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(
                storeService.equipTheme(currentUser.getUserId(), themeName)
        );
    }
}