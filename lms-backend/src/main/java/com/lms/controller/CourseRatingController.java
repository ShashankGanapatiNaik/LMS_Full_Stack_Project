package com.lms.controller;

import com.lms.dto.RatingDto;
import com.lms.entity.User;
import com.lms.service.CourseRatingService;
import com.lms.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/courses/{courseId}/ratings")
@RequiredArgsConstructor
public class CourseRatingController {

    private final CourseRatingService ratingService;
    private final CurrentUserUtil currentUserUtil;

    /**
     * GET /api/courses/{courseId}/ratings
     * Returns average, count, and all reviews.
     * The caller's own rating is included if authenticated.
     */
    @GetMapping
    public ResponseEntity<RatingDto.Summary> getSummary(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        // AnonymousAuthenticationToken.isAuthenticated() returns true — must exclude it explicitly
        boolean isRealUser = authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);

        User viewer = isRealUser ? currentUserUtil.getUser(authentication) : null;
        return ResponseEntity.ok(ratingService.getSummaryForCourse(courseId, viewer));
    }

    /**
     * POST /api/courses/{courseId}/ratings
     * Submit or update a rating. Students only.
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RatingDto.Response> rate(
            @PathVariable Long courseId,
            @RequestBody RatingDto.Request request,
            Authentication authentication
    ) {
        User student = currentUserUtil.getUser(authentication);
        return ResponseEntity.ok(ratingService.rateOrUpdate(student, courseId, request));
    }

    /**
     * DELETE /api/courses/{courseId}/ratings
     * Remove the authenticated student's own rating.
     */
    @DeleteMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User student = currentUserUtil.getUser(authentication);
        ratingService.deleteRating(student, courseId);
        return ResponseEntity.noContent().build();
    }
}
