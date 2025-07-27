package com.ddoddo.backend.controller;

import com.ddoddo.backend.dto.UserInfoResponse;
import com.ddoddo.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/login")
    public ResponseEntity<UserInfoResponse> login(@AuthenticationPrincipal Jwt jwt) {
        log.info("JWT received in login: {}", jwt != null ? "JWT present" : "JWT is null");
        if (jwt != null) {
            log.info("JWT Subject: {}", jwt.getSubject());
            log.info("JWT Claims: {}", jwt.getClaims());
        } else {
            log.warn("JWT is null in login endpoint");
        }
        
        UserInfoResponse userInfo = authService.loginOrRegister(jwt);
        return ResponseEntity.ok(userInfo);
    }
    
    // 토큰 디버깅을 위한 엔드포인트 추가
    @GetMapping("/token-debug")
    public ResponseEntity<Map<String, Object>> debugToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Auth header: {}", authHeader);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            log.info("Token: {}", token.substring(0, Math.min(10, token.length())) + "...");
            
            // JWT 토큰 디코딩 시도
            try {
                Map<String, Object> tokenInfo = decodeJwt(token);
                return ResponseEntity.ok(tokenInfo);
            } catch (Exception e) {
                log.error("토큰 디코딩 실패", e);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "토큰 디코딩 실패: " + e.getMessage());
                errorResponse.put("token_prefix", token.substring(0, Math.min(20, token.length())) + "...");
                return ResponseEntity.ok(errorResponse);
            }
        }
        
        return ResponseEntity.ok(Collections.singletonMap("message", "No Authorization header found"));
    }
    
    // 수동으로 JWT 토큰을 디코딩하는 메서드
    private Map<String, Object> decodeJwt(String token) throws Exception {
        String[] chunks = token.split("\\.");
        
        if (chunks.length != 3) {
            throw new IllegalArgumentException("Invalid JWT token format");
        }
        
        // Base64 디코딩 (패딩 문제 처리)
        Base64.Decoder decoder = Base64.getUrlDecoder();
        
        // 헤더 디코딩
        String header = new String(decoder.decode(chunks[0]));
        Map<String, Object> headerMap = objectMapper.readValue(header, Map.class);
        
        // 페이로드 디코딩
        String payload = new String(decoder.decode(chunks[1]));
        Map<String, Object> payloadMap = objectMapper.readValue(payload, Map.class);
        
        // 결과 맵 생성
        Map<String, Object> result = new HashMap<>();
        result.put("header", headerMap);
        result.put("payload", payloadMap);
        result.put("signature_present", chunks[2] != null && !chunks[2].isEmpty());
        
        return result;
    }
}