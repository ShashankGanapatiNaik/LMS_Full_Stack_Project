package com.lms.controller;

import com.lms.dto.ProgressResponse;
import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.service.CourseService;
import com.lms.service.EnrollmentService;
import com.lms.service.ProgressService;
import com.lms.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;
    private final CurrentUserUtil currentUserUtil;
    private final CourseService courseService;
    private final EnrollmentService enrollmentService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ProgressResponse>> myProgress(Authentication authentication) {
        User student = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(progressService.getProgressForStudent(student));
    }

    @GetMapping("/me/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ProgressResponse> myProgressForCourse(@PathVariable Long courseId, Authentication authentication) {
        User student = currentUserUtil.getUser(authentication);
        Course course = courseService.getCourseById(courseId);
        return ResponseEntity.ok(progressService.getProgressForCourse(student, course));
    }

    // Lets a student (or the frontend) mark manual progress, e.g. after
    // completing a material, as a percentage 0-100.
    @PatchMapping("/me/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> updateMyProgress(@PathVariable Long courseId,
                                                  @RequestBody Map<String, Double> body,
                                                  Authentication authentication) {
        User student = currentUserUtil.getUser(authentication);
        Course course = courseService.getCourseById(courseId);
        enrollmentService.updateProgress(student, course, body.getOrDefault("progressPercent", 0.0));
        return ResponseEntity.ok().build();
    }
}
