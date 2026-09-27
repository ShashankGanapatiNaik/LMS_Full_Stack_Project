package com.lms.controller;

import com.lms.dto.GradeRequest;
import com.lms.dto.SubmissionRequest;
import com.lms.entity.Submission;
import com.lms.entity.User;
import com.lms.service.SubmissionService;
import com.lms.util.CurrentUserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping("/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Submission> submit(@PathVariable Long assignmentId,
                                              @Valid @RequestBody SubmissionRequest request,
                                              Authentication authentication) {
        User student = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(submissionService.submit(assignmentId, student, request));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<List<Submission>> getSubmissionsForAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForAssignment(assignmentId));
    }

    @GetMapping("/submissions/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Submission>> mySubmissions(Authentication authentication) {
        User student = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(submissionService.getSubmissionsForStudent(student));
    }

    @PatchMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Submission> grade(@PathVariable Long submissionId,
                                             @Valid @RequestBody GradeRequest request,
                                             Authentication authentication) {
        User currentUser = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(submissionService.gradeSubmission(submissionId, request, currentUser));
    }
}
