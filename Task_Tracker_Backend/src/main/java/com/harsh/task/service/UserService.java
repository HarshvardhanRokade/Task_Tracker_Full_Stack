package com.harsh.task.service;

import com.harsh.task.domain.dto.UserProfileDto;
import com.harsh.task.entity.User;
import com.harsh.task.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId)); // Replace with your ResourceNotFoundException if you have it!
        return UserProfileDto.fromUser(user);
    }
}