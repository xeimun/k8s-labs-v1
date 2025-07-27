package com.ddoddo.backend.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users") // DB 테이블 이름을 'users'로 지정
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자 보호
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 우리 시스템의 고유 ID

    @Column(unique = true, nullable = false)
    private String uid; // Supabase 에서 받은 User UID, 중복되면 안됨

    @Column(nullable = false)
    private String email;

    private String nickname;

    private String profileImageUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Builder
    public User(String uid, String email, String nickname, String profileImageUrl) {
        this.uid = uid;
        this.email = email;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 사용자 프로필 정보(이메일, 이미지 URL)를 업데이트하는 메서드
     * @param email 새로운 이메일 주소
     * @param profileImageUrl 새로운 프로필 이미지 URL
     */
    public void updateProfile(String email, String profileImageUrl) {
        this.email = email;
        this.profileImageUrl = profileImageUrl;
        this.updatedAt = LocalDateTime.now();
    }
}