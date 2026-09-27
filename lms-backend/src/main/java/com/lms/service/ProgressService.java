package com.lms.service;

import com.lms.dto.ProgressResponse;
import com.lms.entity.Assignment;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.Submission;
import com.lms.entity.User;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.LearningMaterialRepository;
import com.lms.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgressService {

    private final EnrollmentRepository enrollmentRepository;
    private final LearningMaterialRepository materialRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final com.lms.repository.CourseRepository courseRepository;

    /**
     * Simple progress model: percent of a course's assignments that the
     * student has a GRADED submission for. Instructors/students can also
     * manually update progressPercent (e.g. from a "mark material complete"
     * action on the frontend) via EnrollmentService.updateProgress.
     */
    public ProgressResponse getProgressForCourse(User student, Course course) {
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Not enrolled"));

        int totalMaterials = materialRepository.findByCourseOrderByOrderIndexAsc(course).size();
        List<Assignment> courseAssignments = assignmentRepository.findByCourse(course);
        int totalAssignments = courseAssignments.size();

        Set<Long> courseAssignmentIds = courseAssignments.stream()
                .map(Assignment::getId)
                .collect(Collectors.toSet());

        List<Submission> studentSubmissions = submissionRepository.findByStudent(student).stream()
                .filter(s -> s.getAssignment() != null && courseAssignmentIds.contains(s.getAssignment().getId()))
                .collect(Collectors.toList());

        long graded = studentSubmissions.stream()
                .filter(s -> s.getStatus() == Submission.SubmissionStatus.GRADED)
                .count();

        long submitted = studentSubmissions.size();

        double percent = 0.0;
        if (totalAssignments > 0) {
            percent = Math.min(100.0, ((double) Math.max(submitted, graded) / totalAssignments) * 100.0);
        } else if (enrollment.getProgressPercent() != null) {
            percent = enrollment.getProgressPercent();
        }

        return new ProgressResponse(
                course.getId(),
                course.getTitle(),
                percent,
                totalMaterials,
                totalAssignments,
                (int) graded
        );
    }

    @Transactional
    public List<ProgressResponse> getProgressForStudent(User student) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        if (enrollments.isEmpty()) {
            List<Course> publishedCourses = courseRepository.findByPublishedTrue();
            for (Course course : publishedCourses) {
                if (!enrollmentRepository.existsByStudentAndCourse(student, course)) {
                    enrollmentRepository.save(Enrollment.builder()
                            .student(student)
                            .course(course)
                            .progressPercent(0.0)
                            .build());
                }
            }
            enrollments = enrollmentRepository.findByStudent(student);
        }

        return enrollments.stream()
                .map(e -> getProgressForCourse(student, e.getCourse()))
                .collect(Collectors.toList());
    }
}
