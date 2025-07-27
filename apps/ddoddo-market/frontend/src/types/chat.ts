// 채팅방 목록 조회 시 사용하는 타입
export interface ChatRoom {
  roomId: number;
  productId: number;
  productTitle: string;
  productImage: string | null;
  otherUserNickname: string;
}

// 실시간 채팅 메시지 타입
export interface ChatMessage {
  messageId: number;
  senderId: number;
  senderUid: string;
  senderNickname: string;
  message: string;
  createdAt: string;
}