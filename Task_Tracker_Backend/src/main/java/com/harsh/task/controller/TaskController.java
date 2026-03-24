package com.harsh.task.controller;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.domain.dto.CreateTaskRequestDto;
import com.harsh.task.domain.dto.GamificationResultDto;
import com.harsh.task.domain.dto.TaskDto;
import com.harsh.task.domain.dto.UpdateTaskRequestDto;
import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;
import com.harsh.task.mapper.TaskMapper;
import com.harsh.task.security.AuthenticatedUser;
import com.harsh.task.service.CalendarService;
import com.harsh.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final TaskMapper taskMapper;
    private final CalendarService calendarService;

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @Valid @RequestBody CreateTaskRequestDto createTaskRequestDto,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        // Inject userId from token into the request
        CreateTaskRequest taskToCreate = taskMapper.fromDto(
                createTaskRequestDto, currentUser.getUserId()
        );
        Task createdTask = taskService.createTask(taskToCreate);
        return new ResponseEntity<>(taskMapper.toDto(createdTask), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<TaskDto>> listTasks(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = currentUser.getUserId();
        Pageable pageable = PageRequest.of(
                page, size, Sort.by(Sort.Direction.ASC, "created")
        );

        Page<Task> taskPage = (search != null || status != null
                || priority != null || tag != null)
                ? taskService.filterTasks(userId, search, status, priority, tag, pageable)
                : taskService.listTasks(userId, pageable);

        return ResponseEntity.ok(taskPage.map(taskMapper::toDto));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDto> getTask(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Task task = taskService.getTask(taskId, currentUser.getUserId());
        return ResponseEntity.ok(taskMapper.toDto(task));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskRequestDto updateTaskRequestDto,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        UpdateTaskRequest updateRequest = taskMapper.fromDto(updateTaskRequestDto);
        Task updated = taskService.updateTask(
                taskId, updateRequest, currentUser.getUserId()
        );
        return ResponseEntity.ok(taskMapper.toDto(updated));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        taskService.deleteTask(taskId, currentUser.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @PathVariable UUID taskId,
            @RequestParam TaskStatus status,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Task updated = taskService.updateTaskStatus(
                taskId, status, currentUser.getUserId()
        );
        return ResponseEntity.ok(taskMapper.toDto(updated));
    }

    @PostMapping("/{taskId}/complete")
    public ResponseEntity<GamificationResultDto> completeTask(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        GamificationResultDto result = taskService.completeTask(
                taskId, currentUser.getUserId()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{taskId}/pomodoro")
    public ResponseEntity<TaskDto> completePomodoro(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Task updated = taskService.completePomodoro(
                taskId, currentUser.getUserId()
        );
        return ResponseEntity.ok(taskMapper.toDto(updated));
    }

    @GetMapping("/{taskId}/calendar")
    public ResponseEntity<byte[]> downloadCalendarEvent(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Task task = taskService.getTask(taskId, currentUser.getUserId());
        String icsContent = calendarService.generateIcsFile(task);
        byte[] calendarBytes = icsContent.getBytes(
                java.nio.charset.StandardCharsets.UTF_8
        );

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=\"task-" +
                                task.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") +
                                ".ics\"")
                .header("Content-Type", "text/calendar")
                .body(calendarBytes);
    }
}