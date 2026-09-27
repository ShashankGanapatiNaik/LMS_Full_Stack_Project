package com.lms.service;

import com.lms.dto.RatingDto;
import com.lms.entity.Course;
import com.lms.entity.CourseRating;
import com.lms.entity.Role;
import com.lms.entity.User;
import com.lms.repository.CourseRatingRepository;
import com.lms.repository.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseRatingService {

    private final CourseRatingRepository ratingRepository;
    private final CourseService courseService;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Submit or update a rating for a course. Only enrolled students may rate.
     */
    public RatingDto.Response rateOrUpdate(User student, Long courseId, RatingDto.Request req) {
        if (student == null || student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Only students can rate courses.");
        }
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }

        Course course = courseService.getCourseById(courseId);

        // Must be enrolled
        boolean enrolled = enrollmentRepository.existsByStudentAndCourse(student, course);
        if (!enrolled) {
            throw new IllegalStateException("You must be enrolled in the course to rate it.");
        }

        // Upsert
        Optional<CourseRating> existing = ratingRepository.findByStudentIdAndCourseId(student.getId(), courseId);
        CourseRating rating = existing.orElse(CourseRating.builder()
                .student(student)
                .course(course)
                .build());

        rating.setRating(req.getRating());
        rating.setReview(req.getReview());
        CourseRating saved = ratingRepository.save(rating);
        return toResponse(saved);
    }

    /**
     * Get full summary for a course: average, count, all reviews, and the calling user's own rating.
     */
    @Transactional(readOnly = true)
    public RatingDto.Summary getSummaryForCourse(Long courseId, User viewer) {
        List<CourseRating> all = ratingRepository.findByCourseId(courseId);
        Double avg = ratingRepository.findAverageRatingByCourseId(courseId);
        Long count = ratingRepository.countByCourseId(courseId);

        List<RatingDto.Response> reviews = all.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        Integer myRating = null;
        String myReview = null;
        if (viewer != null && viewer.getRole() == Role.STUDENT) {
            Optional<CourseRating> mine = ratingRepository
                    .findByStudentIdAndCourseId(viewer.getId(), courseId);
            if (mine.isPresent()) {
                myRating = mine.get().getRating();
                myReview = mine.get().getReview();
            }
        }

        return RatingDto.Summary.builder()
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : null)
                .totalRatings(count)
                .reviews(reviews)
                .myRating(myRating)
                .myReview(myReview)
                .build();
    }

    /**
     * Delete a student's own rating.
     */
    public void deleteRating(User student, Long courseId) {
        CourseRating rating = ratingRepository
                .findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new EntityNotFoundException("No rating found to delete."));
        ratingRepository.delete(rating);
    }

    private RatingDto.Response toResponse(CourseRating r) {
        return RatingDto.Response.builder()
                .id(r.getId())
                .studentName(r.getStudent().getFullName())
                .rating(r.getRating())
                .review(r.getReview())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
