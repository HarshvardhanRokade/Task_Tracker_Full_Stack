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
import com.harsh.task.service.CalendarService;
import com.harsh.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// @CrossOrigin removed because CorsConfig handles this globally now!
@RestController
@RequestMapping(path = "/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;
    private final TaskMapper taskMapper;
    private final CalendarService calendarService;

    public TaskController (TaskService taskService , TaskMapper taskMapper , CalendarService calendarService){
        this.taskService = taskService;
        this.taskMapper = taskMapper;
        this.calendarService = calendarService;
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @Valid @RequestBody CreateTaskRequestDto createTaskRequestDto) {

        CreateTaskRequest taskToCreate = taskMapper.fromDto(createTaskRequestDto);
        Task createdTask = taskService.createTask(taskToCreate);
        TaskDto createdTaskDto = taskMapper.toDto(createdTask);

        return new ResponseEntity<>(createdTaskDto , HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<TaskDto>> listTasks(
            @RequestParam Long userId, // <-- SECURED: Only fetch this user's tasks
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page , size , Sort.by(Sort.Direction.ASC , "created"));

        Page<Task> taskPage;
        if(search != null || status != null || priority != null || tag != null) {
            taskPage = taskService.filterTasks(userId, search, status, priority, tag, pageable);
        } else {
            taskPage = taskService.listTasks(userId, pageable);
        }

        Page<TaskDto> taskDtos = taskPage.map(taskMapper::toDto);
        return ResponseEntity.ok(taskDtos);
    }

    @PutMapping(path = "/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable UUID taskId,
            @RequestParam Long userId, // <-- SECURED
            @Valid @RequestBody UpdateTaskRequestDto updateTaskRequestDto) {

        UpdateTaskRequest updateTaskRequest = taskMapper.fromDto(updateTaskRequestDto);
        Task updatedTask = taskService.updateTask(taskId, updateTaskRequest, userId);
        TaskDto taskMapperDto = taskMapper.toDto(updatedTask);

        return new ResponseEntity<>(taskMapperDto , HttpStatus.OK);
    }

    @DeleteMapping(path = "/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID taskId,
            @RequestParam Long userId) { // <-- SECURED: Can only delete their own task

        taskService.deleteTask(taskId, userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping(path = "/{taskId}/pomodoro")
    public ResponseEntity<TaskDto> completePomodoro(
            @PathVariable UUID taskId,
            @RequestParam Long userId) { // <-- SECURED

        Task updatedTask = taskService.completePomodoro(taskId, userId);
        TaskDto taskDto = taskMapper.toDto(updatedTask);
        return new ResponseEntity<>(taskDto , HttpStatus.OK);
    }

    @GetMapping(path = "/{taskId}/calendar")
    public ResponseEntity<byte []> downloadCalendarEvent(
            @PathVariable UUID taskId,
            @RequestParam Long userId) { // <-- SECURED

        Task task = taskService.getTask(taskId, userId);
        String icsContent = calendarService.generateIcsFile(task);
        byte[] calendarBytes = icsContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"task-" + task.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") + ".ics\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/calendar")
                .body(calendarBytes);
    }

    @PutMapping(path = "/{taskId}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @PathVariable UUID taskId,
            @RequestParam Long userId, // <-- SECURED
            @RequestParam TaskStatus status) {

        Task updatedTask = taskService.updateTaskStatus(taskId, status, userId);
        TaskDto taskDto = taskMapper.toDto(updatedTask);
        return new ResponseEntity<>(taskDto , HttpStatus.OK);
    }

    @PostMapping("/{taskId}/complete")
    public ResponseEntity<GamificationResultDto> completeTask(
            @PathVariable UUID taskId,
            @RequestParam Long userId) { // <-- SECURED

        GamificationResultDto result = taskService.completeTask(taskId, userId);
        return ResponseEntity.ok(result);
    }
}