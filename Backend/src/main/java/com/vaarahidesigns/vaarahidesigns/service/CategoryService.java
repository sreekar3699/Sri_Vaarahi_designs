package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryService {
    Category saveCategory(Category category);
    Optional<Category> getCategoryById(Integer id);
    Optional<Category> getCategoryByName(String name);
    List<Category> getAllCategories();
    Category updateCategory(Integer id, Category category);
    void deleteCategory(Integer id);
}
