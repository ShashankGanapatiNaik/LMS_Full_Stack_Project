package com.lms.service;

import com.lms.dto.GradeRequest;
import com.lms.dto.SubmissionRequest;
import com.lms.entity.Assignment;
import com.lms.entity.Submission;
import com.lms.entity.User;
import com.lms.repository.SubmissionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentService assignmentService;
    private final com.lms.repository.EnrollmentRepository enrollmentRepository;
    private final com.lms.repository.AssignmentRepository assignmentRepository;

    private final CourseService courseService;

    public Submission submit(Long assignmentId, User student, SubmissionRequest request) {
        Assignment assignment = assignmentService.getAssignmentById(assignmentId);

        Submission submission = submissionRepository.findByAssignmentAndStudent(assignment, student)
                .orElse(Submission.builder().assignment(assignment).student(student).build());

        submission.setSubmissionText(request.getSubmissionText());
        submission.setFileUrl(request.getFileUrl());
        submission.setSubmittedAt(LocalDateTime.now());

        if (assignment.getDueDate() != null && LocalDateTime.now().isAfter(assignment.getDueDate())) {
            submission.setStatus(Submission.SubmissionStatus.LATE);
        } else {
            submission.setStatus(Submission.SubmissionStatus.SUBMITTED);
        }

        Submission saved = submissionRepository.save(submission);
        updateProgress(student, assignment);
        return saved;
    }

    public Submission gradeSubmission(Long submissionId, GradeRequest request) {
        return gradeSubmission(submissionId, request, null);
    }

    public Submission gradeSubmission(Long submissionId, GradeRequest request, User currentUser) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new EntityNotFoundException("Submission not found: " + submissionId));

        if (currentUser != null && submission.getAssignment() != null && submission.getAssignment().getCourse() != null) {
            courseService.validateCourseOwnership(submission.getAssignment().getCourse(), currentUser);
        }

        submission.setScore(request.getScore());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(Submission.SubmissionStatus.GRADED);

        Submission saved = submissionRepository.save(submission);
        if (saved.getStudent() != null && saved.getAssignment() != null) {
            updateProgress(saved.getStudent(), saved.getAssignment());
        }
        return saved;
    }

    private void updateProgress(User student, Assignment assignment) {
        if (assignment == null || assignment.getCourse() == null) return;
        enrollmentRepository.findByStudentAndCourse(student, assignment.getCourse()).ifPresent(enrollment -> {
            int totalAssignments = assignmentRepository.findByCourse(assignment.getCourse()).size();
            if (totalAssignments > 0) {
                long studentSubs = submissionRepository.findByStudent(student).stream()
                        .filter(s -> s.getAssignment() != null && s.getAssignment().getCourse().getId().equals(assignment.getCourse().getId()))
                        .count();
                double percent = Math.min(100.0, ((double) studentSubs / totalAssignments) * 100.0);
                enrollment.setProgressPercent(percent);
                enrollmentRepository.save(enrollment);
            }
        });
    }

    public List<Submission> getSubmissionsForAssignment(Long assignmentId) {
        Assignment assignment = assignmentService.getAssignmentById(assignmentId);
        return submissionRepository.findByAssignment(assignment);
    }

    public List<Submission> getSubmissionsForStudent(User student) {
        return submissionRepository.findByStudent(student);
    }
}
