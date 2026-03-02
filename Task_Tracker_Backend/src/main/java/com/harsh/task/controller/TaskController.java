package com.harsh.task.controller;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.domain.dto.CreateTaskRequestDto;
import com.harsh.task.domain.dto.TaskDto;
import com.harsh.task.domain.dto.UpdateTaskRequestDto;
import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;
import com.harsh.task.mapper.TaskMapper;
import com.harsh.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(path = "/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    private final TaskMapper taskMapper;

    public TaskController (TaskService taskService , TaskMapper taskMapper){
        this.taskService = taskService;
        this.taskMapper = taskMapper;
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @Valid
            @RequestBody CreateTaskRequestDto createTaskRequestDto
            ){

        CreateTaskRequest taskToCreate = taskMapper.fromDto(createTaskRequestDto);

        Task createdTask = taskService.createTask(taskToCreate);

        TaskDto createdTaskDto = taskMapper.toDto(createdTask);

        return new ResponseEntity<>(createdTaskDto , HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> listTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority
            ){

        List<Task> tasks = taskService.filterTasks(search , status , priority);

        tasks.sort(Comparator.comparing(Task::getDueDate , Comparator.nullsLast(Comparator.naturalOrder())));

        List<TaskDto> taskDtoList = tasks.stream()
                .map(taskMapper::toDto)
                .toList();

        return new ResponseEntity<>(taskDtoList , HttpStatus.OK);
    }

    @PutMapping(path = "/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable UUID taskId,
            @Valid
            @RequestBody UpdateTaskRequestDto updateTaskRequestDto
            ){

        UpdateTaskRequest updateTaskRequest = taskMapper.fromDto(updateTaskRequestDto);

        Task updatedTask = taskService.updateTask(taskId, updateTaskRequest);

        TaskDto taskMapperDto = taskMapper.toDto(updatedTask);

        return new ResponseEntity<>(taskMapperDto , HttpStatus.OK);
    }

    @DeleteMapping(path = "/{taskId}")
    public ResponseEntity<Void> deleteTask (
            @PathVariable UUID taskId
    ){
        taskService.deleteTask(taskId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
