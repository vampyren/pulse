/* Pulse Web — vite.config.ts */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'   // ← add this

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // ← add this
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v2': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  define: {
    __APP_BUILD_DATE__: JSON.stringify('2025-08-11'),
    __APP_VERSION__: JSON.stringify('0.1.0')
  }
}))
