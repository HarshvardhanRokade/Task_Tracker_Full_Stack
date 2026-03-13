package com.harsh.task.service.impl;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.domain.dto.GamificationResultDto;
import com.harsh.task.entity.User;
import com.harsh.task.engine.StreakEngine;
import com.harsh.task.engine.StreakResult;
import com.harsh.task.engine.XpEngine;
import com.harsh.task.engine.XpResult;
import com.harsh.task.entity.Tag;
import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;
import com.harsh.task.exception.ResourceNotFoundException;
import com.harsh.task.exception.TaskNotFoundException;
import com.harsh.task.repository.TagRepository;
import com.harsh.task.repository.TaskRepository;
import com.harsh.task.repository.UserRepository;
import com.harsh.task.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final XpEngine xpEngine;
    private final StreakEngine streakEngine;

    private static final int XP_HIGH = 100;
    private static final int GEMS_HIGH = 3;
    private static final int XP_MEDIUM = 75;
    private static final int GEMS_MEDIUM = 2;
    private static final int XP_LOW = 50;
    private static final int GEMS_LOW = 1;

    private static final int STREAK_BONUS_THRESHOLD = 7;
    private static final double STREAK_BONUS_MULTIPLIER = 1.2;
    private static final double DEFAULT_FLOW_MULTIPLIER = 1.0;
    private static final double DEFAULT_EVENT_MULTIPLIER = 1.0;

    public TaskServiceImpl(TaskRepository taskRepository, TagRepository tagRepository,
                           UserRepository userRepository, XpEngine xpEngine, StreakEngine streakEngine) {
        this.taskRepository = taskRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
        this.xpEngine = xpEngine;
        this.streakEngine = streakEngine;
    }

    @Override
    @Transactional
    public Task createTask(CreateTaskRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()));

        Instant now = Instant.now();
        Set<Tag> taskTags = getOrCreateTags(request.tags());

        Task newTask = new Task();
        newTask.setTitle(request.title());
        newTask.setDescription(request.description());
        newTask.setDueDate(request.dueDate());
        newTask.setReminderDateTime(request.reminderDateTime());
        newTask.setReminderSent(false);
        newTask.setStatus(TaskStatus.OPEN);
        newTask.setPriority(request.priority());
        newTask.setCreated(now);
        newTask.setUpdated(now);
        newTask.setPomodoroCount(0);
        newTask.setTags(taskTags);
        newTask.setUser(user);

        return taskRepository.save(newTask);
    }

    // --- SECURED: Only fetches tasks belonging to the user ---
    @Override
    public Page<Task> listTasks(Long userId, Pageable pageable) {
        return taskRepository.findByUserId(userId, pageable);
    }

    @Override
    @Transactional
    public Task updateTask(UUID taskId, UpdateTaskRequest request, Long userId) {
        // Reuse our secured getTask method below!
        Task existingTask = getTask(taskId, userId);

        existingTask.setTitle(request.title());
        existingTask.setDescription(request.description());
        existingTask.setDueDate(request.dueDate());
        existingTask.setReminderDateTime(request.reminderDateTime());
        existingTask.setReminderSent(false);
        existingTask.setStatus(request.status());
        existingTask.setPriority(request.priority());
        existingTask.setUpdated(Instant.now());

        Set<Tag> taskTags = getOrCreateTags(request.tags());
        existingTask.setTags(taskTags);

        return taskRepository.save(existingTask);
    }

    // --- SECURED: Verifies ownership before deleting ---
    @Override
    @Transactional
    public void deleteTask(UUID taskId, Long userId) {
        Task task = getTask(taskId, userId);
        taskRepository.delete(task);
    }

    // --- SECURED: Filters only the user's tasks ---
    @Override
    public Page<Task> filterTasks(Long userId, String search, TaskStatus status, TaskPriority priority , String tag ,Pageable pageable) {
        return taskRepository.filterTasks(userId, search , status , priority , tag ,pageable);
    }

    // --- SECURED: Verifies ownership before logging a pomodoro ---
    @Override
    @Transactional
    public Task completePomodoro(UUID taskId, Long userId) {
        Task task = getTask(taskId, userId);
        int currentCount = task.getPomodoroCount() == null ? 0 : task.getPomodoroCount();
        task.setPomodoroCount(currentCount + 1);
        return taskRepository.save(task);
    }

    private Set<Tag> getOrCreateTags(List<String> tagNames){
        if(tagNames == null  ||  tagNames.isEmpty()){
            return new HashSet<>();
        }

        Set<Tag> tags = new HashSet<>();
        for(String name : tagNames){
            String trimmedName = name.trim();
            if(trimmedName.isEmpty()) continue;

            Tag tag = tagRepository.findByNameIgnoreCase(trimmedName).
                    orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(trimmedName);
                        newTag.setColor("#3b82f6");
                        return tagRepository.save(newTag);
                    });
            tags.add(tag);
        }
        return tags;
    }

    // --- SECURED: The Master Getter. Prevents IDOR by verifying the user owns the task ---
    @Override
    public Task getTask(UUID taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        if (task.getUser().getId() != userId) {
            throw new ResourceNotFoundException("Task not found: " + taskId);
        }
        return task;
    }

    // --- SECURED: Verifies ownership before updating status ---
    @Override
    @Transactional
    public Task updateTaskStatus(UUID taskId, TaskStatus status, Long userId) {
        Task task = getTask(taskId, userId);
        task.setStatus(status);
        task.setUpdated(Instant.now());
        return taskRepository.save(task);
    }

    @Override
    @Transactional
    public GamificationResultDto completeTask(UUID taskId, Long userId) {

        Task task = getTask(taskId, userId); // Use our secured getter!

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new IllegalStateException("Task " + taskId + " is already completed.");
        }

        User user = task.getUser();

        task.setStatus(TaskStatus.COMPLETED);
        task.setUpdated(Instant.now());
        taskRepository.save(task);

        int baseXp;
        int baseGems;
        switch (task.getPriority()) {
            case HIGH -> { baseXp = XP_HIGH; baseGems = GEMS_HIGH; }
            case MEDIUM -> { baseXp = XP_MEDIUM; baseGems = GEMS_MEDIUM; }
            case LOW -> { baseXp = XP_LOW; baseGems = GEMS_LOW; }
            default -> { baseXp = XP_LOW; baseGems = GEMS_LOW; }
        }

        if (user.getCurrentDailyStreak() >= STREAK_BONUS_THRESHOLD) {
            baseXp = (int) Math.round(baseXp * STREAK_BONUS_MULTIPLIER);
        }

        LocalDateTime now = LocalDateTime.now();

        XpResult xpResult = xpEngine.calculate(
                user.getLevel(), user.getCurrentXp(), user.getTotalXp(),
                baseXp, DEFAULT_FLOW_MULTIPLIER, DEFAULT_EVENT_MULTIPLIER
        );

        StreakResult streakResult = streakEngine.calculate(
                user.getCurrentDailyStreak(), user.getLongestDailyStreak(),
                user.getStreakFreezesOwned(), user.getLastActiveTimestamp(), now
        );

        int finalGems = baseGems + xpResult.getLevelUpGemBonus();

        user.setCurrentXp(xpResult.getNewCurrentXp());
        user.setTotalXp(xpResult.getNewTotalXp());
        user.setLevel(xpResult.getNewLevel());
        user.setGemBalance(user.getGemBalance() + finalGems);
        user.setCurrentDailyStreak(streakResult.getNewCurrentDailyStreak());
        user.setLongestDailyStreak(streakResult.getNewLongestDailyStreak());
        user.setStreakFreezesOwned(streakResult.getNewStreakFreezesOwned());
        user.setLastActiveTimestamp(streakResult.getNewLastActiveTimestamp());

        userRepository.save(user);

        return GamificationResultDto.builder()
                .xpEarned(xpResult.getFinalXpEarned())
                .gemsEarned(baseGems)
                .levelUpGemBonus(xpResult.getLevelUpGemBonus())
                .didLevelUp(xpResult.isDidLevelUp())
                .newLevel(xpResult.getNewLevel())
                .currentXp(xpResult.getNewCurrentXp())
                .totalXp(xpResult.getNewTotalXp())
                .xpToNextLevel(xpResult.getXpToNextLevel())
                .dailyStreak(streakResult.getNewCurrentDailyStreak())
                .longestDailyStreak(streakResult.getNewLongestDailyStreak())
                .freezeUsed(streakResult.isFreezeUsed())
                .build();
    }
}