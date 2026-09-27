package com.lms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GradeRequest {
    @NotNull
    private Integer score;
    private String feedback;
}
