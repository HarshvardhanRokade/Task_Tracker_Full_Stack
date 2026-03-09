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

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
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
            @Valid
            @RequestBody CreateTaskRequestDto createTaskRequestDto
            ){

        CreateTaskRequest taskToCreate = taskMapper.fromDto(createTaskRequestDto);

        Task createdTask = taskService.createTask(taskToCreate);

        TaskDto createdTaskDto = taskMapper.toDto(createdTask);

        return new ResponseEntity<>(createdTaskDto , HttpStatus.CREATED);
    }



    @GetMapping
    public ResponseEntity<Page<TaskDto>> listTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            ){

        Pageable pageable = PageRequest.of(page , size , Sort.by(Sort.Direction.ASC , "created"));

        Page<Task> taskPage;
        if(search != null  ||  status != null  || priority != null  ||  tag != null){
            taskPage = taskService.filterTasks(search , status , priority , tag , pageable);
        }
        else {
            taskPage = taskService.listTasks(pageable);
        }

        Page<TaskDto> taskDtos = taskPage.map(taskMapper::toDto);

        return ResponseEntity.ok(taskDtos);
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


    @PostMapping(path = "/{taskId}/pomodoro")
    public ResponseEntity<TaskDto> completePomodoro(@PathVariable UUID taskId){

        Task updatedTask = taskService.completePomodoro(taskId);

        TaskDto taskDto = taskMapper.toDto(updatedTask);

        return new ResponseEntity<>(taskDto , HttpStatus.OK);
    }

    @GetMapping(path = "/{taskId}/calendar")
    public ResponseEntity<byte []> downloadCalendarEvent(@PathVariable UUID taskId){

        Task task = taskService.getTask(taskId);
        String icsContent = calendarService.generateIcsFile(task);
        byte[] calendarBytes = icsContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"task-" + task.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") + ".ics\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/calendar")
                .body(calendarBytes);
    }
}
