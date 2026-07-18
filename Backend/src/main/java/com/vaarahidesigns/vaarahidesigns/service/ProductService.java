package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.Product;
import java.util.List;
import java.util.Optional;

public interface ProductService {
    Product saveProduct(Product product);
    Optional<Product> getProductById(Integer id);
    List<Product> getProductsByCategoryId(Integer categoryId);
    List<Product> getProductsBySubcategoryId(Integer subcategoryId);
    List<Product> searchProductsByTitle(String title);
    List<Product> getAllProducts();
    Product updateProduct(Integer id, Product product);
    void deleteProduct(Integer id);
}
