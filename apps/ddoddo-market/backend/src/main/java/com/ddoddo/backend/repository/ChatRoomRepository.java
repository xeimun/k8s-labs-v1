package com.ddoddo.backend.repository;

import com.ddoddo.backend.domain.ChatRoom;
import com.ddoddo.backend.domain.Product;
import com.ddoddo.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    // 상품과 구매자로 채팅방을 찾는 쿼리
    Optional<ChatRoom> findByProductAndBuyer(Product product, User buyer);

    // 사용자가 구매자이거나 판매자인 모든 채팅방을 찾는 쿼리
    @Query("SELECT cr FROM ChatRoom cr " +
            "JOIN FETCH cr.product p " +
            "JOIN FETCH p.user " + // 판매자 정보
            "JOIN FETCH cr.buyer " + // 구매자 정보
            "WHERE cr.buyer = :user OR p.user = :user")
    List<ChatRoom> findChatRoomsByUser(@Param("user") User user);
}