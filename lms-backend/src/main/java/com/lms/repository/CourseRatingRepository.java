package com.lms.repository;

import com.lms.entity.CourseRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CourseRatingRepository extends JpaRepository<CourseRating, Long> {

    List<CourseRating> findByCourseId(Long courseId);

    Optional<CourseRating> findByStudentIdAndCourseId(Long studentId, Long courseId);

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query("SELECT AVG(r.rating) FROM CourseRating r WHERE r.course.id = :courseId")
    Double findAverageRatingByCourseId(Long courseId);

    @Query("SELECT COUNT(r) FROM CourseRating r WHERE r.course.id = :courseId")
    Long countByCourseId(Long courseId);
}
