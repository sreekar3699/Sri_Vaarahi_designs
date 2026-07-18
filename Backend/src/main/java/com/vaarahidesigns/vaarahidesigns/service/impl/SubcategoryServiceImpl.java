package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Subcategory;
import com.vaarahidesigns.vaarahidesigns.repository.SubcategoryRepository;
import com.vaarahidesigns.vaarahidesigns.service.SubcategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubcategoryServiceImpl implements SubcategoryService {

    private final SubcategoryRepository subcategoryRepository;

    @Override
    public Subcategory saveSubcategory(Subcategory subcategory) {
        return subcategoryRepository.save(subcategory);
    }

    @Override
    public Optional<Subcategory> getSubcategoryById(Integer id) {
        return subcategoryRepository.findById(id);
    }

    @Override
    public List<Subcategory> getSubcategoriesByCategoryId(Integer categoryId) {
        return subcategoryRepository.findByCategoryId(categoryId);
    }

    @Override
    public List<Subcategory> getAllSubcategories() {
        return subcategoryRepository.findAll();
    }

    @Override
    public Subcategory updateSubcategory(Integer id, Subcategory updated) {
        return subcategoryRepository.findById(id).map(existing -> {
            existing.setScName(updated.getScName());
            existing.setCategory(updated.getCategory());
            return subcategoryRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Subcategory not found with id: " + id));
    }

    @Override
    public void deleteSubcategory(Integer id) {
        subcategoryRepository.deleteById(id);
    }
}
