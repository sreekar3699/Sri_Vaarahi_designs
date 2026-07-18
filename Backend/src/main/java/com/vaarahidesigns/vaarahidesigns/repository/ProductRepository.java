package com.vaarahidesigns.vaarahidesigns.repository;

import com.vaarahidesigns.vaarahidesigns.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByCategoryId(Integer categoryId);
    List<Product> findBySubcategoryId(Integer subcategoryId);
    List<Product> findByTitleContainingIgnoreCase(String title);
    Optional<Product> findById(Integer id);
}
