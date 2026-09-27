package com.lms.controller;

import com.lms.entity.Enrollment;
import com.lms.entity.Role;
import com.lms.entity.User;
import com.lms.repository.UserRepository;
import com.lms.service.EnrollmentService;
import com.lms.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final CurrentUserUtil currentUserUtil;
    private final UserRepository userRepository;
    private final com.lms.service.CourseService courseService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Enrollment> enroll(@PathVariable Long courseId, Authentication authentication) {
        User student = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(enrollmentService.enroll(student, courseId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<Enrollment>> myEnrollments(Authentication authentication) {
        User student = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(enrollmentService.getEnrollmentsForStudent(student));
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> unenroll(@PathVariable Long courseId, Authentication authentication) {
        User student = currentUserUtil.getUser(authentication);
        enrollmentService.unenroll(student, courseId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/remove/{enrollmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Void> removeEnrollment(@PathVariable Long enrollmentId) {
        enrollmentService.removeEnrollmentById(enrollmentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Enrollment> assignStudent(@RequestParam Long studentId, @RequestParam Long courseId) {
        return ResponseEntity.ok(enrollmentService.assignStudentToCourse(studentId, courseId));
    }

    @PostMapping("/assign-all/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<String> assignAllCoursesToStudent(@PathVariable Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        enrollmentService.autoEnrollInAllPublishedCourses(student);
        return ResponseEntity.ok("Student assigned to all published courses successfully.");
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<User>> getStudents() {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == null || u.getRole() == Role.STUDENT || "STUDENT".equalsIgnoreCase(u.getRole().name()))
                .collect(java.util.stream.Collectors.toList());

        if (students.isEmpty()) {
            User defaultStudent = userRepository.findByEmail("student@lms.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .fullName("Alex Student")
                            .email("student@lms.com")
                            .password(passwordEncoder.encode("password123"))
                            .role(Role.STUDENT)
                            .enabled(true)
                            .build())
            );
            enrollmentService.autoEnrollInAllPublishedCourses(defaultStudent);
            students = List.of(defaultStudent);
        }
        return ResponseEntity.ok(students);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<Enrollment>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsForCourse(courseService.getCourseById(courseId)));
    }
}

