"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ChatRoom } from "@/types/chat";
import ChatRoomList from "@/components/ChatRoomList";

export default function ChatListPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await api.get<ChatRoom[]>("/api/v1/chat/rooms");
        setChatRooms(response.data);
      } catch (err) {
        console.error("채팅방 목록 로딩 실패:", err);
        setError("채팅방 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <p>채팅방 목록을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return <ChatRoomList chatRooms={chatRooms} />;
}