package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentRequest {
    @NotBlank
    private String title;
    private String instructions;
    private LocalDateTime dueDate;
    private Integer maxScore;
}
