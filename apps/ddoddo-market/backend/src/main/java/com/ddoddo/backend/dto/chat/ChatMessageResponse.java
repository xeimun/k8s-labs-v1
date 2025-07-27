package com.ddoddo.backend.dto.chat;

import com.ddoddo.backend.domain.ChatMessage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponse {
    private Long messageId;
    private Long senderId;
    private String senderUid;
    private String senderNickname;
    private String message;
    private LocalDateTime createdAt;

    @Builder
    public ChatMessageResponse(Long messageId, Long senderId, String senderUid, String senderNickname, String message, LocalDateTime createdAt) {
        this.messageId = messageId;
        this.senderId = senderId;
        this.senderUid = senderUid;
        this.senderNickname = senderNickname;
        this.message = message;
        this.createdAt = createdAt;
    }

    public static ChatMessageResponse from(ChatMessage chatMessage) {
        return ChatMessageResponse.builder()
                .messageId(chatMessage.getId())
                .senderId(chatMessage.getSender().getId())
                .senderUid(chatMessage.getSender().getUid())
                .senderNickname(chatMessage.getSender().getNickname())
                .message(chatMessage.getMessage())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }
}