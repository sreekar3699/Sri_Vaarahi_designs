package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Category;
import com.vaarahidesigns.vaarahidesigns.repository.CategoryRepository;
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
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1);
        category.setName("Sarees");
    }

    @Test
    void saveCategory_shouldReturnSaved() {
        when(categoryRepository.save(category)).thenReturn(category);
        assertThat(categoryService.saveCategory(category)).isEqualTo(category);
    }

    @Test
    void getCategoryById_shouldReturnCategory_whenFound() {
        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        assertThat(categoryService.getCategoryById(1)).isPresent().contains(category);
    }

    @Test
    void getCategoryById_shouldReturnEmpty_whenNotFound() {
        when(categoryRepository.findById(99)).thenReturn(Optional.empty());
        assertThat(categoryService.getCategoryById(99)).isEmpty();
    }

    @Test
    void getCategoryByName_shouldReturnCategory() {
        when(categoryRepository.findByName("Sarees")).thenReturn(Optional.of(category));
        assertThat(categoryService.getCategoryByName("Sarees")).isPresent().contains(category);
    }

    @Test
    void getAllCategories_shouldReturnList() {
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        assertThat(categoryService.getAllCategories()).hasSize(1);
    }

    @Test
    void updateCategory_shouldUpdateAndReturn() {
        Category updated = new Category();
        updated.setName("Blouses");

        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenAnswer(i -> i.getArguments()[0]);

        Category result = categoryService.updateCategory(1, updated);
        assertThat(result.getName()).isEqualTo("Blouses");
    }

    @Test
    void updateCategory_shouldThrow_whenNotFound() {
        when(categoryRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> categoryService.updateCategory(99, category))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Category not found");
    }

    @Test
    void deleteCategory_shouldCallDeleteById() {
        doNothing().when(categoryRepository).deleteById(1);
        categoryService.deleteCategory(1);
        verify(categoryRepository).deleteById(1);
    }
}
