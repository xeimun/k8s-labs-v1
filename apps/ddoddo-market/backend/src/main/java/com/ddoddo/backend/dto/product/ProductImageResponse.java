package com.ddoddo.backend.dto.product;

import com.ddoddo.backend.domain.ProductImage;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private int displayOrder;

    public static ProductImageResponse from(ProductImage productImage) {
        return ProductImageResponse.builder()
                .id(productImage.getId())
                .imageUrl(productImage.getImageUrl())
                .displayOrder(productImage.getDisplayOrder())
                .build();
    }
}