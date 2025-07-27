package com.ddoddo.backend.dto.chat;

import com.ddoddo.backend.domain.ChatRoom;
import com.ddoddo.backend.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
public class ChatRoomResponse {
    private Long roomId;
    private Long productId;
    private String productTitle;
    private String productImage; // 대표 이미지 URL
    private String otherUserNickname; // 상대방 닉네임
    // private String lastMessage; // (MVP 이후 추가)
    // private LocalDateTime lastMessageTime; // (MVP 이후 추가)

    @Builder
    public ChatRoomResponse(Long roomId, Long productId, String productTitle, String productImage, String otherUserNickname) {
        this.roomId = roomId;
        this.productId = productId;
        this.productTitle = productTitle;
        this.productImage = productImage;
        this.otherUserNickname = otherUserNickname;
    }

    public static ChatRoomResponse of(ChatRoom chatRoom, User currentUser) {
        User otherUser = chatRoom.getBuyer().equals(currentUser) ? chatRoom.getProduct().getUser() : chatRoom.getBuyer();
        String representativeImage = chatRoom.getProduct().getImages().isEmpty() ? null : chatRoom.getProduct().getImages().get(0).getImageUrl();

        return ChatRoomResponse.builder()
                .roomId(chatRoom.getId())
                .productId(chatRoom.getProduct().getId())
                .productTitle(chatRoom.getProduct().getTitle())
                .productImage(representativeImage)
                .otherUserNickname(otherUser.getNickname())
                .build();
    }
}