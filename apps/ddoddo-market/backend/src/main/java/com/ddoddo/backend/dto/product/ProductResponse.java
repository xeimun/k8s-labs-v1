package com.ddoddo.backend.dto.product;

import com.ddoddo.backend.domain.Product;
import com.ddoddo.backend.domain.ProductStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class ProductResponse {
    private Long id;
    private String title;
    private String content;
    private Integer price;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 작성자 정보
    private String userUid;
    private String userNickname;
    private String userProfileImageUrl;

    // 추가된 이미지 목록 필드
    private List<ProductImageResponse> images;

    public static ProductResponse from(Product product) {
        // 이미지가 null일 경우를 대비하여 안전하게 처리
        List<ProductImageResponse> imageResponses = product.getImages() != null
                ? product.getImages().stream()
                .map(ProductImageResponse::from)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .content(product.getContent())
                .price(product.getPrice())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .userUid(product.getUser().getUid())
                .userNickname(product.getUser().getNickname())
                .userProfileImageUrl(product.getUser().getProfileImageUrl())
                .images(imageResponses) // 빌더에 이미지 목록 추가
                .build();
    }
}