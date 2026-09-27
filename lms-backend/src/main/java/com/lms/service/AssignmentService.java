package com.lms.service;

import com.lms.dto.AssignmentRequest;
import com.lms.entity.Assignment;
import com.lms.entity.Course;
import com.lms.repository.AssignmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import com.lms.entity.User;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseService courseService;

    public Assignment createAssignment(Long courseId, AssignmentRequest request) {
        return createAssignment(courseId, request, null);
    }

    public Assignment createAssignment(Long courseId, AssignmentRequest request, User currentUser) {
        Course course = courseService.getCourseById(courseId);
        if (currentUser != null) {
            courseService.validateCourseOwnership(course, currentUser);
        }
        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .instructions(request.getInstructions())
                .dueDate(request.getDueDate())
                .maxScore(request.getMaxScore() != null ? request.getMaxScore() : 100)
                .course(course)
                .build();
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAssignmentsForCourse(Long courseId) {
        Course course = courseService.getCourseById(courseId);
        return assignmentRepository.findByCourse(course);
    }

    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found: " + id));
    }

    public void deleteAssignment(Long id) {
        deleteAssignment(id, null);
    }

    public void deleteAssignment(Long id, User currentUser) {
        Assignment assignment = getAssignmentById(id);
        if (currentUser != null) {
            courseService.validateCourseOwnership(assignment.getCourse(), currentUser);
        }
        assignmentRepository.delete(assignment);
    }
}
