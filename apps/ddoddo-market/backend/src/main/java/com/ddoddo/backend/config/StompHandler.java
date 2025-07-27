package com.ddoddo.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Slf4j 어노테이션 추가
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication; // Authentication import
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken; // JwtAuthenticationToken import
import org.springframework.stereotype.Component;

import java.util.Collections;

@Slf4j // 로그 추가
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class StompHandler implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // STOMP 연결 요청(CONNECT)일 때 JWT 토큰 검증
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("STOMP CONNECT: 토큰이 존재하지 않습니다.");
                // 에러를 던지는 대신 연결을 거부하는 다른 방법을 사용할 수도 있습니다.
                // 여기서는 예외를 던져 연결 자체를 막습니다.
                throw new SecurityException("토큰이 존재하지 않습니다.");
            }

            String token = authHeader.substring(7);

            try {
                // 토큰 디코딩 및 검증
                Jwt jwt = jwtDecoder.decode(token);
                // ✅ [수정] JWT를 Spring Security의 Authentication 객체로 변환
                Authentication authentication = new JwtAuthenticationToken(jwt, Collections.emptyList());

                // ✅ [수정] STOMP 세션에 인증 정보 설정
                accessor.setUser(authentication);

                log.info("STOMP CONNECT: 사용자 인증 성공, User: {}", authentication.getName());

            } catch (JwtException e) {
                log.error("STOMP CONNECT: 유효하지 않은 토큰입니다. Token: {}", token, e);
                throw new SecurityException("유효하지 않은 토큰입니다.", e);
            }
        } else if (StompCommand.SEND.equals(accessor.getCommand())) {
            // SEND 요청 시 사용자 정보 로깅 (디버깅용)
            if (accessor.getUser() != null) {
                log.info("STOMP SEND: User: {}", accessor.getUser().getName());
            } else {
                log.warn("STOMP SEND: 인증된 사용자를 찾을 수 없습니다.");
            }
        }

        return message;
    }
}