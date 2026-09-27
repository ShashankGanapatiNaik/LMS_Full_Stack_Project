package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class RatingDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        private Integer rating;
        private String review;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String studentName;
        private Integer rating;
        private String review;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Summary {
        private Double averageRating;
        private Long totalRatings;
        private List<Response> reviews;
        private Integer myRating;
        private String myReview;
    }
}
