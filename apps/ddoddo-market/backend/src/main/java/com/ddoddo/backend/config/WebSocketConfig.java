package com.ddoddo.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // STOMP를 사용하기 위해 선언하는 어노테이션
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompHandler stompHandler;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지 브로커가 처리할 경로의 접두사를 설정
        // /topic으로 시작하는 경로로 들어오는 메시지는 브로커가 구독자들에게 직접 전달
        registry.enableSimpleBroker("/topic");

        // 클라이언트에서 서버로 메시지를 보낼 때 사용할 경로의 접두사를 설정
        // /app으로 시작하는 경로는 @MessageMapping이 붙은 메서드로 라우팅됨
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트에서 웹소켓에 연결할 때 사용할 엔드포인트를 등록
        // SockJS는 웹소켓을 지원하지 않는 브라우저를 위한 대체 옵션
        registry.addEndpoint("/ws-stomp")
                .setAllowedOrigins("http://localhost:3000")
//                .setAllowedOriginPatterns("*") // TODO: 프로덕션 환경에서는 특정 도메인만 허용하도록 변경해야 합니다.
                ;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // 클라이언트에서 들어오는 메시지를 처리하는 채널에 인터셉터 추가
        registration.interceptors(stompHandler);
    }
}