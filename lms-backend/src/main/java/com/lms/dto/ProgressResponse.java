package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProgressResponse {
    private Long courseId;
    private String courseTitle;
    private double progressPercent;
    private int totalMaterials;
    private int totalAssignments;
    private int gradedSubmissions;
}
