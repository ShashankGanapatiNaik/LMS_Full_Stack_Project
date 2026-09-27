package com.lms.controller;

import com.lms.dto.AssignmentRequest;
import com.lms.entity.Assignment;
import com.lms.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.lms.entity.User;
import com.lms.util.CurrentUserUtil;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping("/courses/{courseId}/assignments")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Assignment> createAssignment(@PathVariable Long courseId,
                                                        @Valid @RequestBody AssignmentRequest request,
                                                        Authentication authentication) {
        User currentUser = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(assignmentService.createAssignment(courseId, request, currentUser));
    }

    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<List<Assignment>> getAssignments(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsForCourse(courseId));
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<Assignment> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id,
                                                Authentication authentication) {
        User currentUser = currentUserUtil.getUser(authentication);
        assignmentService.deleteAssignment(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
