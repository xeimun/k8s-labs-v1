import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 보호할 경로와 공개 전용 경로를 배열로 정의
const protectedRoutes = ["/mypage", "/products/new", "/products/[id]/edit"];
const publicOnlyRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => {
    // 동적 경로 ([id]) 처리를 위한 정규식 변환
    const regex = new RegExp(`^${route.replace(/\[.*?\]/g, "[^/]+")}$`);
    return regex.test(pathname);
  });

  if (!user && isProtectedRoute) {
    console.log(
      `[Middleware] 비로그인 사용자 접근 제한: ${pathname} -> /login`
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && publicOnlyRoutes.some((route) => pathname.startsWith(route))) {
    console.log(`[Middleware] 로그인 사용자 접근 제한: ${pathname} -> /`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
