package com.ddoddo.backend.repository;

import com.ddoddo.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Supabase UID 로 사용자를 찾기 위한 메서드
    Optional<User> findByUid(String uid);
}
