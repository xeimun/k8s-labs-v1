package com.ddoddo.backend.repository;

import com.ddoddo.backend.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("select p from Product p left join fetch p.images where p.id = :id")
    Optional<Product> findByIdWithImages(@Param("id") Long id);
} 