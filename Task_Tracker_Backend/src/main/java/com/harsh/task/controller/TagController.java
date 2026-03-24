package com.harsh.task.controller;

import com.harsh.task.domain.dto.TagDto;
import com.harsh.task.security.AuthenticatedUser;
import com.harsh.task.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<TagDto>> getAllTags(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(
                tagService.getAllTags(currentUser.getUserId())
        );
    }

    @PostMapping
    public ResponseEntity<TagDto> createTag(
            @RequestBody TagDto request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tagService.createTag(request));
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<Void> deleteTag(@PathVariable UUID tagId) {
        tagService.deleteTag(tagId);
        return ResponseEntity.noContent().build();
    }
}