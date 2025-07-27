package com.ddoddo.backend.service;

import com.ddoddo.backend.domain.User;
import com.ddoddo.backend.dto.UserInfoResponse;
import com.ddoddo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true) // 데이터 변경이 없는 읽기 전용 트랜잭션
    public UserInfoResponse getUserInfo(String uid) {
        // uid로 사용자를 찾고, 없으면 예외 발생 (정상적이라면 로그인 시점에 이미 생성되어 있어야 함)
        User user = userRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다: " + uid));

        return UserInfoResponse.from(user);
    }
}
