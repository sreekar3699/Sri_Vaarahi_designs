package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.Subcategory;
import java.util.List;
import java.util.Optional;

public interface SubcategoryService {
    Subcategory saveSubcategory(Subcategory subcategory);
    Optional<Subcategory> getSubcategoryById(Integer id);
    List<Subcategory> getSubcategoriesByCategoryId(Integer categoryId);
    List<Subcategory> getAllSubcategories();
    Subcategory updateSubcategory(Integer id, Subcategory subcategory);
    void deleteSubcategory(Integer id);
}
