package com.lms.controller;

import com.lms.dto.CourseRequest;
import com.lms.dto.MaterialRequest;
import com.lms.entity.Course;
import com.lms.entity.LearningMaterial;
import com.lms.entity.Role;
import com.lms.entity.User;
import com.lms.service.CourseService;
import com.lms.util.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CurrentUserUtil currentUserUtil;

    // Public: anyone can browse published courses (no auth header needed)
    @GetMapping("/public")
    public ResponseEntity<List<Course>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getAllPublished());
    }

    // Public: get a single published course by ID (no auth needed)
    @GetMapping("/public/{id}")
    public ResponseEntity<Course> getPublicCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // Get courses created by logged-in instructor (or all courses if admin)
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<List<Course>> getMyCourses(Authentication authentication) {
        User instructor = currentUserUtil.getUser(authentication);
        if (instructor.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(courseService.getAllCourses());
        }
        return ResponseEntity.ok(courseService.getCoursesByInstructor(instructor));
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            User user = currentUserUtil.getUser(authentication);
            if (user.getRole() == Role.INSTRUCTOR) {
                return ResponseEntity.ok(courseService.getCoursesByInstructor(user));
            }
        }
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Course> createCourse(@Valid @RequestBody CourseRequest request,
                                                Authentication authentication) {
        User instructor = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(courseService.createCourse(request, instructor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id,
                                                @Valid @RequestBody CourseRequest request,
                                                Authentication authentication) {
        User currentUser = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(courseService.updateCourse(id, request, currentUser));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Course> publishCourse(@PathVariable Long id,
                                                 @RequestParam boolean published,
                                                 Authentication authentication) {
        User currentUser = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(courseService.setPublished(id, published, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id,
                                              Authentication authentication) {
        User currentUser = currentUserUtil.getUser(authentication);
        courseService.deleteCourse(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    // Materials
    @PostMapping("/{id}/materials")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<LearningMaterial> addMaterial(@PathVariable Long id,
                                                        @Valid @RequestBody MaterialRequest request,
                                                        Authentication authentication) {
        User currentUser = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(courseService.addMaterial(id, request, currentUser));
    }

    @GetMapping("/{id}/materials")
    public ResponseEntity<List<LearningMaterial>> getMaterials(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getMaterials(id));
    }

    @DeleteMapping("/materials/{materialId}")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long materialId,
                                               Authentication authentication) {
        User currentUser = currentUserUtil.getUser(authentication);
        courseService.deleteMaterial(materialId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
