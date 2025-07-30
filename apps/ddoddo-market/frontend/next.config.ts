import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 💡 빌드 시 ESLint 검사를 무시합니다.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 💡 빌드 시 TypeScript 타입 검사를 무시합니다.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
