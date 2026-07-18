package com.vaarahidesigns.vaarahidesigns.controller;

import com.vaarahidesigns.vaarahidesigns.entity.Subcategory;
import com.vaarahidesigns.vaarahidesigns.service.SubcategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
@RequiredArgsConstructor
public class SubcategoryController {

    private final SubcategoryService subcategoryService;

    @PostMapping
    public ResponseEntity<Subcategory> createSubcategory(@RequestBody Subcategory subcategory) {
        return ResponseEntity.ok(subcategoryService.saveSubcategory(subcategory));
    }

    @GetMapping
    public ResponseEntity<List<Subcategory>> getAllSubcategories() {
        return ResponseEntity.ok(subcategoryService.getAllSubcategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subcategory> getSubcategoryById(@PathVariable Integer id) {
        return subcategoryService.getSubcategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Subcategory>> getSubcategoriesByCategoryId(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(subcategoryService.getSubcategoriesByCategoryId(categoryId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subcategory> updateSubcategory(@PathVariable Integer id, @RequestBody Subcategory subcategory) {
        try {
            return ResponseEntity.ok(subcategoryService.updateSubcategory(id, subcategory));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubcategory(@PathVariable Integer id) {
        subcategoryService.deleteSubcategory(id);
        return ResponseEntity.noContent().build();
    }
}
