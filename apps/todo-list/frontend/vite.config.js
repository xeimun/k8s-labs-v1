import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 모든 인터페이스에 바인딩
    port: 3000, // 환경 변수를 통해 포트를 설정
    proxy: {
      // '/api'로 시작하는 요청을 백엔드로 프록시
      '/api': {
        target: `${import.meta.env}/api`, // Spring Boot 백엔드 컨테이너 주소
        changeOrigin: true,
      },
      // '/auth'로 시작하는 요청도 백엔드로 프록시
      '/auth': {
        target: `${import.meta.env}/api`, // Spring Boot 백엔드 컨테이너 주소
        changeOrigin: true,
      },
    },
  },
});
