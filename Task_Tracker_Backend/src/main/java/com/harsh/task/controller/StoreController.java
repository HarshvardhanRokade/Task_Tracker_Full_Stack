package com.harsh.task.controller;

import com.harsh.task.domain.dto.PurchaseRequestDto;
import com.harsh.task.domain.dto.PurchaseResultDto;
import com.harsh.task.domain.dto.UserInventoryDto;
import com.harsh.task.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping("/inventory")
    public ResponseEntity<UserInventoryDto> getInventory(@RequestParam Long userId) {
        return ResponseEntity.ok(storeService.getInventory(userId));
    }

    @PostMapping("/purchase")
    public ResponseEntity<PurchaseResultDto> purchaseItem(
            @RequestParam Long userId,
            @Valid @RequestBody PurchaseRequestDto request) {
        return ResponseEntity.ok(storeService.purchaseItem(userId, request));
    }

    @PostMapping("/equip-theme")
    public ResponseEntity<PurchaseResultDto> equipTheme(
            @RequestParam Long userId,
            @RequestParam String themeName) {
        return ResponseEntity.ok(storeService.equipTheme(userId, themeName));
    }
}