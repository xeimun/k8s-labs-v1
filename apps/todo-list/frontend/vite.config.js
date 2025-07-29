import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: `${process.env.VITE_API_URL}`, // 환경 변수 사용
        changeOrigin: true,
      },
      '/auth': {
        target: `${process.env.VITE_API_URL}`, // 동일한 백엔드 주소 사용
        changeOrigin: true,
      },
    },
  },
});
