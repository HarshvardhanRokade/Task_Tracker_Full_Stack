package com.harsh.task.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "badge_key", nullable = false, unique = true, length = 50)
    private String badgeKey;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "icon", nullable = false, length = 10)
    private String icon;

    @Column(name = "category", nullable = false, length = 20)
    private String category;

    @Column(name = "requirement_value", nullable = false)
    private int requirementValue;
}