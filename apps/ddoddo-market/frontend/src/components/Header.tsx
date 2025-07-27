"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton"; // 기존 로그아웃 버튼 재사용
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [pathname]); // 경로 변경 시 사용자 정보 다시 확인

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          또또마켓
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="/products"
            className={`text-gray-600 hover:text-blue-500 ${
              pathname === "/products" ? "font-bold text-blue-500" : ""
            }`}
          >
            상품 목록
          </Link>
          {user && (
            <>
              <Link
                href="/chat"
                className={`text-gray-600 hover:text-blue-500 ${
                  pathname.startsWith("/chat") ? "font-bold text-blue-500" : ""
                }`}
              >
                채팅
              </Link>
              <Link
                href="/mypage"
                className={`text-gray-600 hover:text-blue-500 ${
                  pathname === "/mypage" ? "font-bold text-blue-500" : ""
                }`}
              >
                마이페이지
              </Link>
              <LogoutButton />
            </>
          )}
          {!user && pathname !== "/login" && (
            <Link href="/login">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                로그인
              </button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}