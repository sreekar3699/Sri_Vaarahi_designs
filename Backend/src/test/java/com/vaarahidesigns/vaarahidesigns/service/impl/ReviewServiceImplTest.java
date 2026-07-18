package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Product;
import com.vaarahidesigns.vaarahidesigns.entity.Review;
import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private Review review;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1);

        Product product = new Product();
        product.setId(1);

        review = new Review();
        review.setId(1);
        review.setUser(user);
        review.setProduct(product);
        review.setProductReview("Excellent quality!");
        review.setRatingStars(5);
    }

    @Test
    void saveReview_shouldReturnSaved() {
        when(reviewRepository.save(review)).thenReturn(review);
        assertThat(reviewService.saveReview(review)).isEqualTo(review);
    }

    @Test
    void getReviewById_shouldReturnReview_whenFound() {
        when(reviewRepository.findById(1)).thenReturn(Optional.of(review));
        assertThat(reviewService.getReviewById(1)).isPresent().contains(review);
    }

    @Test
    void getReviewById_shouldReturnEmpty_whenNotFound() {
        when(reviewRepository.findById(99)).thenReturn(Optional.empty());
        assertThat(reviewService.getReviewById(99)).isEmpty();
    }

    @Test
    void getReviewsByProductId_shouldReturnList() {
        when(reviewRepository.findByProductId(1)).thenReturn(List.of(review));
        assertThat(reviewService.getReviewsByProductId(1)).hasSize(1);
    }

    @Test
    void getReviewsByUserId_shouldReturnList() {
        when(reviewRepository.findByUserId(1)).thenReturn(List.of(review));
        assertThat(reviewService.getReviewsByUserId(1)).hasSize(1);
    }

    @Test
    void getAllReviews_shouldReturnList() {
        when(reviewRepository.findAll()).thenReturn(List.of(review));
        assertThat(reviewService.getAllReviews()).hasSize(1);
    }

    @Test
    void updateReview_shouldUpdateAndReturn() {
        Review updated = new Review();
        updated.setProductReview("Good product");
        updated.setRatingStars(4);

        when(reviewRepository.findById(1)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> i.getArguments()[0]);

        Review result = reviewService.updateReview(1, updated);
        assertThat(result.getProductReview()).isEqualTo("Good product");
        assertThat(result.getRatingStars()).isEqualTo(4);
    }

    @Test
    void updateReview_shouldThrow_whenNotFound() {
        when(reviewRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> reviewService.updateReview(99, review))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Review not found");
    }

    @Test
    void deleteReview_shouldCallDeleteById() {
        doNothing().when(reviewRepository).deleteById(1);
        reviewService.deleteReview(1);
        verify(reviewRepository).deleteById(1);
    }
}
