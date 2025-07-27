import { ChatRoom } from "@/types/chat";
import Link from "next/link";

interface ChatRoomListProps {
  chatRooms: ChatRoom[];
}

export default function ChatRoomList({ chatRooms }: ChatRoomListProps) {
  if (chatRooms.length === 0) {
    return <div className="p-4 text-center text-gray-500">채팅방이 없습니다.</div>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {chatRooms.map((room) => (
        <li key={room.roomId} className="p-4 hover:bg-gray-50">
          <Link href={`/chat/${room.roomId}`}>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-12 rounded-lg object-cover"
                  src={room.productImage || "/placeholder.png"}
                  alt={room.productTitle}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {room.productTitle}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {room.otherUserNickname}님과의 대화
                </p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}