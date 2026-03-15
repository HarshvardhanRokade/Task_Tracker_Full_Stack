package com.harsh.task.service;

import com.harsh.task.domain.dto.TagDto;
import java.util.List;

public interface TagService {

    List<TagDto> getAllTags();

    TagDto createTag(TagDto request);
}