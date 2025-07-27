package com.ddoddo.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;

import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3UploadService {

    private final S3Client s3Client; // AmazonS3Client -> S3Client (v2)

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 예: 5MB

    // 허용할 이미지 Content-Type 목록을 상수로 정의합니다.
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            MediaType.IMAGE_JPEG_VALUE, // "image/jpeg"
            MediaType.IMAGE_PNG_VALUE,  // "image/png"
            MediaType.IMAGE_GIF_VALUE,  // "image/gif"
            "image/webp"                // WebP 추가
    );

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.s3.public-url}")
    private String publicUrl;

    public String upload(MultipartFile multipartFile, String dirName) throws IOException {
        // 파일 확장자 및 크기 검증
        validateFile(multipartFile);

        String originalFilename = multipartFile.getOriginalFilename();
        String s3FileName = dirName + "/" + UUID.randomUUID() + "_" + originalFilename;

        // PutObjectRequest (v2)
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(s3FileName)
                .acl(ObjectCannedACL.PUBLIC_READ) // ACL 설정
                .build();

        // RequestBody (v2)
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(multipartFile.getBytes()));

        return publicUrl + "/" + s3FileName;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일은 업로드할 수 없습니다.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다.");
        }

        String contentType = file.getContentType();

        // 허용 목록에 포함되어 있는지 확인하는 로직
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 가능)");
        }
    }

    public void deleteImage(String fileUrl) {
        try {
            // 1. 전체 URL에서 경로(/<버킷이름>/<파일경로>)를 추출합니다.
            String path = new URL(fileUrl).getPath();

            // 2. URL에서 파일 키(key)를 추출합니다.
            // 예: https://pub-xxx.r2.dev/product-images/abc.png -> product-images/abc.png
            String key = fileUrl.substring(publicUrl.length() + 1);
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("R2에서 파일 삭제 성공: {}", key);
        } catch (Exception e) {
            log.error("R2 파일 삭제 실패. URL: {}, 에러: {}", fileUrl, e.getMessage());
        }
    }

}