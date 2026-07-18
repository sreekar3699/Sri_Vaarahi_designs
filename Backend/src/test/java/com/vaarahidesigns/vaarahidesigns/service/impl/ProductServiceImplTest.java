package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Category;
import com.vaarahidesigns.vaarahidesigns.entity.Product;
import com.vaarahidesigns.vaarahidesigns.entity.Subcategory;
import com.vaarahidesigns.vaarahidesigns.repository.ProductRepository;
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
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1);

        Subcategory subcategory = new Subcategory();
        subcategory.setId(1);

        product = new Product();
        product.setId(1);
        product.setTitle("Kanjivaram Saree");
        product.setDescription("Pure silk saree");
        product.setPrice(5000.0f);
        product.setDiscount(10);
        product.setAvailableStock(50);
        product.setCategory(category);
        product.setSubcategory(subcategory);
    }

    @Test
    void saveProduct_shouldReturnSaved() {
        when(productRepository.save(product)).thenReturn(product);
        assertThat(productService.saveProduct(product)).isEqualTo(product);
    }

    @Test
    void getProductById_shouldReturnProduct_whenFound() {
        when(productRepository.findById(1)).thenReturn(Optional.of(product));
        assertThat(productService.getProductById(1)).isPresent().contains(product);
    }

    @Test
    void getProductById_shouldReturnEmpty_whenNotFound() {
        when(productRepository.findById(99)).thenReturn(Optional.empty());
        assertThat(productService.getProductById(99)).isEmpty();
    }

    @Test
    void getProductsByCategoryId_shouldReturnList() {
        when(productRepository.findByCategoryId(1)).thenReturn(List.of(product));
        assertThat(productService.getProductsByCategoryId(1)).hasSize(1);
    }

    @Test
    void getProductsBySubcategoryId_shouldReturnList() {
        when(productRepository.findBySubcategoryId(1)).thenReturn(List.of(product));
        assertThat(productService.getProductsBySubcategoryId(1)).hasSize(1);
    }

    @Test
    void searchProductsByTitle_shouldReturnList() {
        when(productRepository.findByTitleContainingIgnoreCase("saree")).thenReturn(List.of(product));
        assertThat(productService.searchProductsByTitle("saree")).hasSize(1);
    }

    @Test
    void getAllProducts_shouldReturnList() {
        when(productRepository.findAll()).thenReturn(List.of(product));
        assertThat(productService.getAllProducts()).hasSize(1);
    }

    @Test
    void updateProduct_shouldUpdateAndReturn() {
        Product updated = new Product();
        updated.setTitle("Updated Saree");
        updated.setDescription("Updated desc");
        updated.setPrice(6000.0f);
        updated.setDiscount(5);
        updated.setAvailableStock(30);
        updated.setCategory(product.getCategory());
        updated.setSubcategory(product.getSubcategory());

        when(productRepository.findById(1)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);

        Product result = productService.updateProduct(1, updated);
        assertThat(result.getTitle()).isEqualTo("Updated Saree");
        assertThat(result.getPrice()).isEqualTo(6000.0f);
    }

    @Test
    void updateProduct_shouldThrow_whenNotFound() {
        when(productRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> productService.updateProduct(99, product))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void deleteProduct_shouldCallDeleteById() {
        doNothing().when(productRepository).deleteById(1);
        productService.deleteProduct(1);
        verify(productRepository).deleteById(1);
    }
}
