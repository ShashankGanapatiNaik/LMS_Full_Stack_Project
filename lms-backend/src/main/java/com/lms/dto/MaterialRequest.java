package com.lms.dto;

import com.lms.entity.LearningMaterial;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MaterialRequest {
    @NotBlank
    private String title;
    private LearningMaterial.MaterialType type;
    private String contentUrlOrText;
    private Integer orderIndex;
}
