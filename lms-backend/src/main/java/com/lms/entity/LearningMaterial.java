package com.lms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType type; // VIDEO, DOCUMENT, LINK, NOTES

    @Column(length = 3000)
    private String contentUrlOrText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    @Builder.Default
    private Integer orderIndex = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MaterialType {
        VIDEO, DOCUMENT, LINK, NOTES
    }
}
