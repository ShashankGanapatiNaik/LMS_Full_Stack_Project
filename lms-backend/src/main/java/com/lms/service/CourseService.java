package com.lms.service;

import com.lms.dto.CourseRequest;
import com.lms.dto.MaterialRequest;
import com.lms.entity.Assignment;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.LearningMaterial;
import com.lms.entity.Role;
import com.lms.entity.Submission;
import com.lms.entity.User;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.LearningMaterialRepository;
import com.lms.repository.SubmissionRepository;
import com.lms.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final LearningMaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public Course createCourse(CourseRequest request, User instructor) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .instructor(instructor)
                .published(request.isPublished())
                .build();
        Course savedCourse = courseRepository.save(course);

        if (savedCourse.isPublished()) {
            autoEnrollStudents(savedCourse);
        }
        return savedCourse;
    }

    public List<Course> getAllPublished() {
        return courseRepository.findByPublishedTrue();
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByInstructor(User instructor) {
        return courseRepository.findByInstructor(instructor);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
    }

    public void validateCourseOwnership(Course course, User user) {
        if (user != null && user.getRole() == Role.ADMIN) {
            return;
        }
        if (user == null || course.getInstructor() == null || !course.getInstructor().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You can only modify your own courses.");
        }
    }

    public Course updateCourse(Long id, CourseRequest request) {
        return updateCourse(id, request, null);
    }

    public Course updateCourse(Long id, CourseRequest request, User currentUser) {
        Course course = getCourseById(id);
        if (currentUser != null) {
            validateCourseOwnership(course, currentUser);
        }
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPublished(request.isPublished());
        Course updated = courseRepository.save(course);

        if (updated.isPublished()) {
            autoEnrollStudents(updated);
        }
        return updated;
    }

    public Course setPublished(Long id, boolean published) {
        return setPublished(id, published, null);
    }

    public Course setPublished(Long id, boolean published, User currentUser) {
        Course course = getCourseById(id);
        if (currentUser != null) {
            validateCourseOwnership(course, currentUser);
        }
        course.setPublished(published);
        Course updated = courseRepository.save(course);

        if (published) {
            autoEnrollStudents(updated);
        }
        return updated;
    }

    private void autoEnrollStudents(Course course) {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        for (User student : students) {
            if (!enrollmentRepository.existsByStudentAndCourse(student, course)) {
                enrollmentRepository.save(Enrollment.builder()
                        .student(student)
                        .course(course)
                        .progressPercent(0.0)
                        .build());
            }
        }
    }

    public void deleteCourse(Long id) {
        deleteCourse(id, null);
    }

    public void deleteCourse(Long id, User currentUser) {
        Course course = getCourseById(id);
        if (currentUser != null) {
            validateCourseOwnership(course, currentUser);
        }
        List<Assignment> assignments = assignmentRepository.findByCourse(course);

        // 1. Delete all submissions for assignments in this course
        for (Assignment assignment : assignments) {
            List<Submission> submissions = submissionRepository.findByAssignment(assignment);
            if (!submissions.isEmpty()) {
                submissionRepository.deleteAll(submissions);
                submissionRepository.flush();
            }
        }

        // 2. Delete all assignments in this course
        if (!assignments.isEmpty()) {
            assignmentRepository.deleteAll(assignments);
            assignmentRepository.flush();
        }

        // 3. Delete all enrollments for this course
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        if (!enrollments.isEmpty()) {
            enrollmentRepository.deleteAll(enrollments);
            enrollmentRepository.flush();
        }

        // 4. Delete all learning materials for this course
        List<LearningMaterial> materials = materialRepository.findByCourseOrderByOrderIndexAsc(course);
        if (!materials.isEmpty()) {
            materialRepository.deleteAll(materials);
            materialRepository.flush();
        }

        // 5. Delete course
        courseRepository.delete(course);
        courseRepository.flush();
    }

    public LearningMaterial addMaterial(Long courseId, MaterialRequest request) {
        return addMaterial(courseId, request, null);
    }

    public LearningMaterial addMaterial(Long courseId, MaterialRequest request, User currentUser) {
        Course course = getCourseById(courseId);
        if (currentUser != null) {
            validateCourseOwnership(course, currentUser);
        }
        LearningMaterial material = LearningMaterial.builder()
                .title(request.getTitle())
                .type(request.getType())
                .contentUrlOrText(request.getContentUrlOrText())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .course(course)
                .build();
        return materialRepository.save(material);
    }

    public List<LearningMaterial> getMaterials(Long courseId) {
        Course course = getCourseById(courseId);
        return materialRepository.findByCourseOrderByOrderIndexAsc(course);
    }

    public void deleteMaterial(Long materialId) {
        deleteMaterial(materialId, null);
    }

    public void deleteMaterial(Long materialId, User currentUser) {
        LearningMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Material not found: " + materialId));
        if (currentUser != null) {
            validateCourseOwnership(material.getCourse(), currentUser);
        }
        materialRepository.delete(material);
    }
}
