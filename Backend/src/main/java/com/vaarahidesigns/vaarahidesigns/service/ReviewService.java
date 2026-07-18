package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.Review;
import java.util.List;
import java.util.Optional;

public interface ReviewService {
    Review saveReview(Review review);
    Optional<Review> getReviewById(Integer id);
    List<Review> getReviewsByProductId(Integer productId);
    List<Review> getReviewsByUserId(Integer userId);
    List<Review> getAllReviews();
    Review updateReview(Integer id, Review review);
    void deleteReview(Integer id);
}
