package com.harsh.task.service.impl;

import com.harsh.task.domain.dto.TagDto;
import com.harsh.task.entity.Tag;
import com.harsh.task.repository.TagRepository;
import com.harsh.task.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    public List<TagDto> getAllTags() {
        return tagRepository.findAll()
                .stream()
                .map(t -> new TagDto(t.getId(), t.getName(), t.getColor()))
                .toList();
    }

    @Override
    @Transactional
    public TagDto createTag(TagDto request) {
        Tag tag = new Tag();
        // Trim the name so we don't accidentally save tags with trailing spaces
        tag.setName(request.name().trim());

        // Fallback to default blue if no color is provided by the frontend
        tag.setColor(request.color() != null ? request.color() : "#3b82f6");

        Tag saved = tagRepository.save(tag);

        return new TagDto(saved.getId(), saved.getName(), saved.getColor());
    }
}