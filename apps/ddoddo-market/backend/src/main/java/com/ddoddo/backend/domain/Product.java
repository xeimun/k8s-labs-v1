package com.ddoddo.backend.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    @Builder
    public Product(String title, String content, Integer price, User user) {
        this.title = title;
        this.content = content;
        this.price = price;
        this.status = ProductStatus.FOR_SALE;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    // 연관관계 편의 메서드
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void update(String title, String content, Integer price, ProductStatus status) {
        this.title = title;
        this.content = content;
        this.price = price;
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isOwner(String uid) {
        return this.user.getUid().equals(uid);
    }
} 