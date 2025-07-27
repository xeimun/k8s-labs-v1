package com.ddoddo.backend.dto.product;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProductCreateRequest {
    private String title;
    private String content;
    private Integer price;
} 