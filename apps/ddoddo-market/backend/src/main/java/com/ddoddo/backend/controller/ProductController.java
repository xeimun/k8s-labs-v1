package com.ddoddo.backend.controller;

import com.ddoddo.backend.dto.product.ProductCreateRequest;
import com.ddoddo.backend.dto.product.ProductResponse;
import com.ddoddo.backend.dto.product.ProductUpdateRequest;
import com.ddoddo.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    /**
     * 상품 등록
     */
    @PostMapping(consumes = {"multipart/form-data"}) // multipart/form-data 형식 명시
    public ResponseEntity<ProductResponse> createProduct(
            @RequestPart("request") ProductCreateRequest request, // @RequestBody -> @RequestPart
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal Jwt jwt) throws IOException {
        String uid = jwt.getSubject();
        ProductResponse response = productService.createProduct(request, images, uid);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
//    /**
//     * 상품 등록
//     */
//    @PostMapping
//    public ResponseEntity<ProductResponse> createProduct(
//            @RequestBody ProductCreateRequest request,
//            @AuthenticationPrincipal Jwt jwt) {
//        String uid = jwt.getSubject();
//        ProductResponse response = productService.createProduct(request, uid);
//        return ResponseEntity.status(HttpStatus.CREATED).body(response);
//    }

    /**
     * 상품 상세 조회
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long productId) {
        ProductResponse response = productService.getProduct(productId);
        return ResponseEntity.ok(response);
    }

    /**
     * 상품 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * 상품 수정
     */
    @PatchMapping(value = "/{productId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @RequestPart("request") ProductUpdateRequest request,
            @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages,
            @AuthenticationPrincipal Jwt jwt) throws IOException {

        String uid = jwt.getSubject();

        ProductResponse response = productService.updateProduct(productId, request, newImages, uid);
        return ResponseEntity.ok(response);
    }

    /**
     * 상품 삭제
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal Jwt jwt) {
        String uid = jwt.getSubject();
        productService.deleteProduct(productId, uid);
        return ResponseEntity.noContent().build();
    }
} 