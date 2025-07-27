package com.ddoddo.backend.controller;

import com.ddoddo.backend.dto.UserInfoResponse;
import com.ddoddo.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 현재 인증된 사용자의 정보를 조회하는 엔드포인트
     * @param jwt 인증된 사용자의 JWT 정보
     * @return 현재 사용자의 상세 정보
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getMyInfo(@AuthenticationPrincipal Jwt jwt) {
        String uid = jwt.getSubject();
        UserInfoResponse userInfo = userService.getUserInfo(uid);
        return ResponseEntity.ok(userInfo);
    }
}