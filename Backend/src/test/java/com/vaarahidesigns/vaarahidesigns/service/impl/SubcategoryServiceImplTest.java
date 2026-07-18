package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Category;
import com.vaarahidesigns.vaarahidesigns.entity.Subcategory;
import com.vaarahidesigns.vaarahidesigns.repository.SubcategoryRepository;
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
class SubcategoryServiceImplTest {

    @Mock
    private SubcategoryRepository subcategoryRepository;

    @InjectMocks
    private SubcategoryServiceImpl subcategoryService;

    private Subcategory subcategory;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1);

        subcategory = new Subcategory();
        subcategory.setId(1);
        subcategory.setScName("Silk Sarees");
        subcategory.setCategory(category);
    }

    @Test
    void saveSubcategory_shouldReturnSaved() {
        when(subcategoryRepository.save(subcategory)).thenReturn(subcategory);
        assertThat(subcategoryService.saveSubcategory(subcategory)).isEqualTo(subcategory);
    }

    @Test
    void getSubcategoryById_shouldReturnSubcategory_whenFound() {
        when(subcategoryRepository.findById(1)).thenReturn(Optional.of(subcategory));
        assertThat(subcategoryService.getSubcategoryById(1)).isPresent().contains(subcategory);
    }

    @Test
    void getSubcategoryById_shouldReturnEmpty_whenNotFound() {
        when(subcategoryRepository.findById(99)).thenReturn(Optional.empty());
        assertThat(subcategoryService.getSubcategoryById(99)).isEmpty();
    }

    @Test
    void getSubcategoriesByCategoryId_shouldReturnList() {
        when(subcategoryRepository.findByCategoryId(1)).thenReturn(List.of(subcategory));
        assertThat(subcategoryService.getSubcategoriesByCategoryId(1)).hasSize(1);
    }

    @Test
    void getAllSubcategories_shouldReturnList() {
        when(subcategoryRepository.findAll()).thenReturn(List.of(subcategory));
        assertThat(subcategoryService.getAllSubcategories()).hasSize(1);
    }

    @Test
    void updateSubcategory_shouldUpdateAndReturn() {
        Subcategory updated = new Subcategory();
        updated.setScName("Cotton Sarees");
        updated.setCategory(subcategory.getCategory());

        when(subcategoryRepository.findById(1)).thenReturn(Optional.of(subcategory));
        when(subcategoryRepository.save(any(Subcategory.class))).thenAnswer(i -> i.getArguments()[0]);

        Subcategory result = subcategoryService.updateSubcategory(1, updated);
        assertThat(result.getScName()).isEqualTo("Cotton Sarees");
    }

    @Test
    void updateSubcategory_shouldThrow_whenNotFound() {
        when(subcategoryRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> subcategoryService.updateSubcategory(99, subcategory))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Subcategory not found");
    }

    @Test
    void deleteSubcategory_shouldCallDeleteById() {
        doNothing().when(subcategoryRepository).deleteById(1);
        subcategoryService.deleteSubcategory(1);
        verify(subcategoryRepository).deleteById(1);
    }
}
