package com.ddoddo.backend.service;

import com.ddoddo.backend.domain.User;
import com.ddoddo.backend.dto.UserInfoResponse;
import com.ddoddo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.Objects; // Objects 임포트 추가

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    @Transactional
    public UserInfoResponse loginOrRegister(Jwt jwt) {
        String uid = jwt.getSubject();

        // 1. JWT에서 최신 사용자 정보를 파싱합니다.
        String email = jwt.getClaimAsString("email");
        Map<String, Object> userMetadata = jwt.getClaimAsMap("user_metadata");
        String picture = null;
        if (userMetadata != null) {
            if (userMetadata.containsKey("picture")) {
                picture = (String) userMetadata.get("picture");
            } else if (userMetadata.containsKey("avatar_url")) {
                picture = (String) userMetadata.get("avatar_url");
            }
        }

        // 2. DB에서 사용자를 조회합니다.
        Optional<User> userOptional = userRepository.findByUid(uid);

        User user;
        if (userOptional.isPresent()) {
            // --- 사용자가 이미 존재할 경우: 업데이트 로직 ---
            user = userOptional.get();

            // DB의 이메일 또는 프로필 사진이 JWT의 정보와 다른 경우 업데이트
            if (!Objects.equals(user.getEmail(), email) || !Objects.equals(user.getProfileImageUrl(), picture)) {
                user.updateProfile(email, picture); // User 엔티티의 업데이트 메서드 호출
                // save는 @Transactional에 의해 더티 체킹(Dirty Checking)되므로 명시적으로 호출하지 않아도 DB에 반영됩니다.
                // 하지만 명시적으로 save를 호출하는 것도 좋은 습관입니다.
                // userRepository.save(user);
            }
        } else {
            // --- 사용자가 존재하지 않을 경우: 생성 로직 ---
            User newUser = User.builder()
                    .uid(uid)
                    .email(email)
                    .nickname("또또" + System.currentTimeMillis())
                    .profileImageUrl(picture)
                    .build();
            user = userRepository.save(newUser);
        }

        return UserInfoResponse.from(user);
    }
}