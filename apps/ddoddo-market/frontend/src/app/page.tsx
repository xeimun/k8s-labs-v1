import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import LogoutButton from "../components/LogoutButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">
          또또마켓에 오신 것을 환영합니다!
        </h1>
        {user ? (
          <div className="space-y-4">
            <p className="text-lg">
              로그인되었습니다:{" "}
              <span className="font-semibold">{user.email}</span>
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link href="/mypage">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  마이페이지로 이동
                </button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg">중고거래를 시작하려면 로그인해주세요.</p>
            <Link href="/login">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                로그인 페이지로 이동
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
