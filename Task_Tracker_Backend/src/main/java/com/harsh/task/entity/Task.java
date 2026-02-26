package com.harsh.task.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
@ToString
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id" , nullable = false , updatable = false)
    private UUID id;

    @Column(name = "title" , nullable = false)
    private String title;

    @Column(name = "description" , length = 1000)
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status" , nullable = false)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority" , nullable = false)
    private TaskPriority priority;

    @Column(name = "created" , nullable = false , updatable = false)
    private Instant created;

    @Column(name = "updated" , nullable = false)
    private Instant updated;
}
