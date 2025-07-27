package com.ddoddo.backend.controller;

import com.ddoddo.backend.dto.chat.ChatMessageRequest;
import com.ddoddo.backend.dto.chat.ChatMessageResponse;
import com.ddoddo.backend.dto.chat.ChatRoomResponse;
import com.ddoddo.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
// @RequestMapping("/api/v1/chat") // MessageMapping은 이 경로를 따르지 않음
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat/message/{roomId}")
    public void message(
            @DestinationVariable Long roomId,
            @Payload ChatMessageRequest messageRequest,
            Principal principal) {

        String senderUid = principal.getName();
        chatService.saveAndSendMessage(roomId, senderUid, messageRequest.getMessage());
    }

    // 채팅방 생성 또는 조회
    @PostMapping("/api/v1/chat/rooms")
    public ResponseEntity<Map<String, Long>> getOrCreateRoom(
            @RequestParam Long productId,
            @AuthenticationPrincipal Jwt jwt) {
        String buyerUid = jwt.getSubject();
        Long roomId = chatService.findOrCreateRoom(productId, buyerUid);
        return ResponseEntity.created(URI.create("/api/v1/chat/rooms/" + roomId))
                .body(Collections.singletonMap("roomId", roomId));
    }

    // 내 채팅방 목록 조회
    @GetMapping("/api/v1/chat/rooms")
    public ResponseEntity<List<ChatRoomResponse>> getMyRooms(@AuthenticationPrincipal Jwt jwt) {
        String userUid = jwt.getSubject();
        List<ChatRoomResponse> myChatRooms = chatService.findMyChatRooms(userUid);
        return ResponseEntity.ok(myChatRooms);
    }

    @GetMapping("/api/v1/chat/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(@PathVariable Long roomId) {
        // ChatService를 통해 특정 채팅방의 모든 메시지를 조회합니다.
        List<ChatMessageResponse> messages = chatService.getMessagesByRoomId(roomId);
        return ResponseEntity.ok(messages);
    }
}