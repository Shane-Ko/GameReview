import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api/chat': 'http://localhost:8001',
      '/api/health': 'http://localhost:8001',
      // json-server (yarn start) — 프론트는 상대경로로 호출하므로 개발 중에는 프록시로 넘긴다
      '/games': 'http://localhost:3000',
      '/genres': 'http://localhost:3000',
      '/reviews': 'http://localhost:3000'
    }
  }
})
