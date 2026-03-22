package com.harsh.task.service.impl;

import com.harsh.task.domain.dto.TagDto;
import com.harsh.task.entity.Tag;
import com.harsh.task.exception.ResourceNotFoundException;
import com.harsh.task.repository.TagRepository;
import com.harsh.task.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    public List<TagDto> getAllTags(Long userId) {
        // ✨ Now uses the smart filter query!
        return tagRepository.findTagsForOpenTasks(userId)
                .stream()
                .map(t -> new TagDto(t.getId(), t.getName(), t.getColor()))
                .toList();
    }

    @Override
    @Transactional
    public TagDto createTag(TagDto request) {
        String trimmedName = request.name().trim();

        // 1. Check if the tag ALREADY exists anywhere in the DB (even on completed tasks)
        Optional<Tag> existingTag = tagRepository.findByNameIgnoreCase(trimmedName);

        if (existingTag.isPresent()) {
            // ✨ THE FIX: Instead of throwing an error, just return the existing tag!
            // This will make the "ghost" tag reappear in your UI.
            Tag tag = existingTag.get();
            return new TagDto(tag.getId(), tag.getName(), tag.getColor());
        }

        // 2. If it truly doesn't exist, create it as usual
        Tag tag = new Tag();
        tag.setName(trimmedName);
        tag.setColor(request.color() != null ? request.color() : "#3b82f6");
        Tag saved = tagRepository.save(tag);

        return new TagDto(saved.getId(), saved.getName(), saved.getColor());
    }

    @Override
    @Transactional
    public void deleteTag(UUID tagId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + tagId));

        if (tagRepository.isTagInUse(tagId)) {
            throw new IllegalStateException(
                    "Cannot delete tag '" + tag.getName() +
                            "' — it is still attached to one or more quests. " +
                            "Remove it from all quests first."
            );
        }

        tagRepository.delete(tag);
        log.info("Tag {} ({}) deleted successfully", tagId, tag.getName());
    }
}