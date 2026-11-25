import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// 브라우저는 항상 같은 출처의 /api 만 부른다.
// 개발·미리보기에서는 Vite가 /api 를 백엔드로 넘기고, 배포에서는 nginx가 같은 일을 한다 (nginx/default.conf.template).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    '/api': {
      target: env.API_PROXY_TARGET || 'http://localhost:3000',
      // 배포 주소(https://tracer.kangdora.me)를 대상으로 해도 동작하도록 Host를 대상에 맞춘다
      changeOrigin: true,
      xfwd: true,
    },
  }

  return {
    plugins: [react()],
    server: { port: 9000, strictPort: true, proxy },
    preview: { port: 9000, strictPort: true, proxy },
  }
})
