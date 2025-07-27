package com.ddoddo.backend.service;

import com.ddoddo.backend.domain.ChatMessage;
import com.ddoddo.backend.domain.ChatRoom;
import com.ddoddo.backend.domain.Product;
import com.ddoddo.backend.domain.User;
import com.ddoddo.backend.dto.chat.ChatMessageResponse;
import com.ddoddo.backend.dto.chat.ChatRoomResponse;
import com.ddoddo.backend.repository.ChatMessageRepository;
import com.ddoddo.backend.repository.ChatRoomRepository;
import com.ddoddo.backend.repository.ProductRepository;
import com.ddoddo.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate; // 메시지 전송을 위한 템플릿

    @Transactional
    public Long findOrCreateRoom(Long productId, String buyerUid) {
        User buyer = userRepository.findByUid(buyerUid)
                .orElseThrow(() -> new EntityNotFoundException("구매자를 찾을 수 없습니다."));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다."));

        // 판매자와 구매자가 동일하면 채팅방 생성 불가
        if (product.getUser().getUid().equals(buyerUid)) {
            throw new IllegalArgumentException("자신과의 채팅방은 생성할 수 없습니다.");
        }

        ChatRoom chatRoom = chatRoomRepository.findByProductAndBuyer(product, buyer)
                .orElseGet(() -> {
                    ChatRoom newChatRoom = ChatRoom.builder()
                            .product(product)
                            .buyer(buyer)
                            .build();
                    return chatRoomRepository.save(newChatRoom);
                });

        return chatRoom.getId();
    }

    public List<ChatRoomResponse> findMyChatRooms(String userUid) {
        User user = userRepository.findByUid(userUid)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        List<ChatRoom> chatRooms = chatRoomRepository.findChatRoomsByUser(user);

        return chatRooms.stream()
                .map(chatRoom -> ChatRoomResponse.of(chatRoom, user))
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveAndSendMessage(Long roomId, String senderUid, String messageContent) {
        User sender = userRepository.findByUid(senderUid)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));

        // 1. 메시지를 DB에 저장
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .message(messageContent)
                .build();
        chatMessageRepository.save(chatMessage);

        // 2. DTO로 변환
        ChatMessageResponse messageResponse = ChatMessageResponse.from(chatMessage);

        // 3. /topic/chat/room/{roomId} 토픽을 구독 중인 클라이언트에게 메시지를 전송
        messagingTemplate.convertAndSend("/topic/chat/room/" + roomId, messageResponse);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessagesByRoomId(Long roomId) {
        // ChatMessageRepository를 사용하여 특정 채팅방의 모든 메시지를 생성 시간 순으로 조회합니다.
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId);

        // 조회된 메시지 엔티티 목록을 ChatMessageResponse DTO 목록으로 변환하여 반환합니다.
        return messages.stream()
                .map(ChatMessageResponse::from)
                .collect(Collectors.toList());
    }
}