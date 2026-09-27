package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseService courseService;
    private final UserRepository userRepository;

    public Enrollment enroll(User student, Long courseId) {
        if (student == null || student.getRole() != com.lms.entity.Role.STUDENT) {
            throw new IllegalArgumentException("Only students are permitted to enroll in courses.");
        }
        Course course = courseService.getCourseById(courseId);

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            return enrollmentRepository.findByStudentAndCourse(student, course).orElseGet(() ->
                enrollmentRepository.save(Enrollment.builder()
                        .student(student)
                        .course(course)
                        .progressPercent(0.0)
                        .build())
            );
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercent(0.0)
                .build();

        return enrollmentRepository.save(enrollment);
    }

    public Enrollment assignStudentToCourse(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found: " + studentId));
        if (student.getRole() != com.lms.entity.Role.STUDENT) {
            throw new IllegalArgumentException("Target user must be a student.");
        }
        return enroll(student, courseId);
    }

    public void autoEnrollInAllPublishedCourses(User student) {
        if (student == null || student.getRole() != com.lms.entity.Role.STUDENT) {
            return;
        }
        List<Course> publishedCourses = courseService.getAllPublished();
        for (Course course : publishedCourses) {
            if (!enrollmentRepository.existsByStudentAndCourse(student, course)) {
                Enrollment enrollment = Enrollment.builder()
                        .student(student)
                        .course(course)
                        .progressPercent(0.0)
                        .build();
                enrollmentRepository.save(enrollment);
            }
        }
    }

    public List<Enrollment> getEnrollmentsForStudent(User student) {
        return enrollmentRepository.findByStudent(student);
    }

    public List<Enrollment> getEnrollmentsForCourse(Course course) {
        return enrollmentRepository.findByCourse(course);
    }

    public Enrollment getEnrollment(User student, Course course) {
        return enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new EntityNotFoundException("Not enrolled in this course"));
    }

    public void updateProgress(User student, Course course, double progressPercent) {
        Enrollment enrollment = getEnrollment(student, course);
        enrollment.setProgressPercent(progressPercent);
        enrollmentRepository.save(enrollment);
    }

    public void unenroll(User student, Long courseId) {
        Course course = courseService.getCourseById(courseId);
        Enrollment enrollment = getEnrollment(student, course);
        enrollmentRepository.delete(enrollment);
    }

    public void removeEnrollmentById(Long enrollmentId) {
        enrollmentRepository.deleteById(enrollmentId);
    }
}

