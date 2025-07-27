package com.ddoddo.backend.dto.product;

import com.ddoddo.backend.domain.ProductStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ProductUpdateRequest {
    private String title;
    private String content;
    private Integer price;
    private ProductStatus status;
    private List<Long> deleteImageIds;
} 