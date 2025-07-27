import axios from "axios";
import { createClient } from "@/utils/supabase/client";

// Supabase 클라이언트 (클라이언트 컴포넌트용)
const supabase = createClient();

// Axios 인스턴스 생성
const api = axios.create({
  // 백엔드 API 기본 URL 설정
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터(Request Interceptor) 설정
//    - 모든 API 요청이 보내지기 전에 이 코드가 먼저 실행됩니다.
api.interceptors.request.use(
  async (config) => {
    // Supabase에서 현재 세션 정보를 가져옵니다.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 세션이 유효하고 토큰이 존재하면
    if (session?.access_token) {
      // 요청 헤더에 Authorization을 추가합니다.
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    // 수정된 설정(config)을 반환하여 요청을 이어갑니다.
    return config;
  },
  (error) => {
    // 요청 설정 중 에러가 발생하면 여기서 처리합니다.
    return Promise.reject(error);
  }
);

// 응답 인터셉터(Response Interceptor) (선택사항)
//    - 전역적인 응답 에러 처리에 유용합니다.
api.interceptors.response.use(
  (response) => {
    // 정상 응답은 그대로 반환
    return response;
  },
  (error) => {
    // 여기서 401(Unauthorized), 403(Forbidden) 등 공통 에러를 처리할 수 있습니다.
    if (error.response?.status === 401) {
      // 예: 강제 로그아웃 처리 또는 토큰 갱신 로직 호출
      console.error("인증 에러가 발생했습니다. 로그아웃 될 수 있습니다.");
    }
    return Promise.reject(error);
  }
);

export default api;
