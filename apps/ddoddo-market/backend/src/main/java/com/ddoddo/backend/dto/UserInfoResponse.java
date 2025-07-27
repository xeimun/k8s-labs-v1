package com.ddoddo.backend.dto;

import com.ddoddo.backend.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserInfoResponse {
    private final Long id;          // 우리 시스템의 User ID
    private final String uid;       // Supabase User UID
    private final String email;
    private final String nickname;
    private final String profileImageUrl;

    @Builder
    private UserInfoResponse(Long id, String uid, String email, String nickname, String profileImageUrl) {
        this.id = id;
        this.uid = uid;
        this.email = email;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
    }

    // User 엔티티를 응답 DTO로 변환하는 정적 팩토리 메서드
    public static UserInfoResponse from(User user) {
        return UserInfoResponse.builder()
                .id(user.getId())
                .uid(user.getUid())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
