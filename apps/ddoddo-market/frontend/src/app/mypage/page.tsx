"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api"; // 직접 커스텀하게 만든 Axios API 클라이언트 import
import Link from "next/link";

// 백엔드의 UserInfoResponse DTO와 일치하는 타입 정의
interface UserProfile {
  id: number;
  uid: string;
  email: string;
  nickname: string;
  profileImageUrl: string;
}

export default function MyPage() {
  // 상태 변수 설정: 프로필 정보, 로딩 상태, 에러 상태
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // API 호출: '/api/v1/users/me'로 GET 요청
        // Axios 인터셉터가 자동으로 헤더에 JWT 토큰을 추가해줌
        const response = await api.get<UserProfile>("/api/v1/users/me");
        setProfile(response.data); // 성공 시 프로필 상태 업데이트
      } catch (err: any) {
        console.error("마이페이지 정보 로딩 실패:", err);
        setError(
          "프로필 정보를 불러오는 데 실패했습니다. 다시 로그인해주세요."
        );
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };

    fetchUserProfile();
  }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

  // 로딩 중일 때 보여줄 UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">마이페이지 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 에러 발생 시 보여줄 UI
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <Link href="/login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            로그인 페이지로 이동
          </button>
        </Link>
      </div>
    );
  }

  // 정상적으로 데이터를 가져왔을 때 보여줄 UI
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">마이페이지</h1>
        {profile && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img
                src={profile.profileImageUrl}
                alt={`${profile.nickname}의 프로필 이미지`}
                className="w-24 h-24 rounded-full border-2 border-gray-300"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600">닉네임</label>
              <p className="text-lg p-2 bg-gray-100 rounded">
                {profile.nickname}
              </p>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600">이메일</label>
              <p className="text-lg p-2 bg-gray-100 rounded">{profile.email}</p>
            </div>
            <div className="text-center mt-6">
              <Link href="/">
                <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                  홈으로 돌아가기
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
