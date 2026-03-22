package com.harsh.task.service;

import com.harsh.task.domain.dto.TagDto;
import java.util.List;
import java.util.UUID;

public interface TagService {

    List<TagDto> getAllTags(Long userId);

    TagDto createTag(TagDto request);

    void deleteTag(UUID tagId);
}