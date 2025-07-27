import { useState, useEffect, useRef } from "react";
import { Client, IFrame } from "@stomp/stompjs";
import { ChatMessage } from "@/types/chat";
import { createClient } from "@/utils/supabase/client";

// 훅의 인자로 roomId와 onMessageReceived 콜백 함수를 받습니다.
export function useChat(
  roomId: string,
  onMessageReceived: (message: ChatMessage) => void
) {
  const [connectionStatus, setConnectionStatus] = useState("대기 중...");
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    if (!roomId) {
      setConnectionStatus("채팅방 정보가 없어 대기 중입니다.");
      return;
    }

    const initializeChat = async () => {
      console.log("[채팅 진단] 1. 채팅 연결을 시작합니다.");
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error(
          "[채팅 진단] 🚨 Supabase 세션을 가져올 수 없습니다:",
          error
        );
        setConnectionStatus("인증 실패");
        return;
      }

      const session = data.session;
      console.log("[채팅 진단] 2. Supabase 세션을 성공적으로 가져왔습니다.");

      if (stompClient.current) {
        console.log("[채팅 진단] 이전 연결이 남아있어 비활성화합니다.");
        stompClient.current.deactivate();
      }

      const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
        /^http/,
        "ws"
      )}/ws-stomp`;

      console.log(`[채팅 진단] 3. 연결할 WebSocket 주소: ${wsUrl}`);
      console.log(
        `[채팅 진단] 3-1. 사용할 인증 토큰: Bearer ${session.access_token.substring(
          0,
          30
        )}...`
      );

      const client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: `Bearer ${session.access_token}`,
        },
        debug: (str) => {
          // console.log(`[STOMP 상세 로그] ${str}`);
        },
        reconnectDelay: 10000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // 연결 성공 시 호출됩니다.
      client.onConnect = (frame: IFrame) => {
        console.log("[채팅 진단] ✅ 4. STOMP 연결 성공!", frame);
        setConnectionStatus("연결됨");
        // 서버로부터 메시지가 도착하면, props로 받은 onMessageReceived 함수를 호출합니다.
        client.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          onMessageReceived(receivedMessage);
        });
      };

      // STOMP 프로토콜 수준의 에러
      client.onStompError = (frame: IFrame) => {
        console.error("[채팅 진단] 🚨 4-1. STOMP 에러 발생!", frame);
        setConnectionStatus(
          `연결 실패: ${frame.headers["message"] || "서버 응답 없음"}`
        );
      };

      // WebSocket 전송 계층 자체의 에러
      client.onWebSocketError = (event: Event) => {
        console.error("[채팅 진단] 🚨 4-2. WebSocket 자체 에러 발생!", event);
        setConnectionStatus("웹소켓 연결 오류");
      };

      console.log("[채팅 진단] 3-2. STOMP 클라이언트 활성화를 시도합니다.");
      client.activate();
      stompClient.current = client;
    };

    initializeChat();

    return () => {
      if (stompClient.current?.active) {
        console.log("[채팅 진단] 컴포넌트가 사라져 연결을 종료합니다.");
        stompClient.current.deactivate();
      }
    };
    // onMessageReceived 함수가 변경될 때마다 useEffect가 재실행되는 것을 방지하기 위해 의존성 배열에서 제거합니다.
    // (함수는 렌더링마다 재생성될 수 있으므로, useCallback으로 감싸거나 의존성에서 빼는 것이 좋습니다.)
  }, [roomId]);

  const sendMessage = (messageContent: string) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/chat/message/${roomId}`,
        body: JSON.stringify({ message: messageContent }),
      });
    } else {
      console.error(
        "[메시지 전송 실패] STOMP 연결이 활성화되지 않았습니다. 현재 상태:",
        connectionStatus
      );
      alert(`메시지를 보낼 수 없습니다. 연결 상태: ${connectionStatus}`);
    }
  };

  return { sendMessage, connectionStatus };
}