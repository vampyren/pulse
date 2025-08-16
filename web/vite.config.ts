/* Pulse Web — vite.config.ts
 * Version: v0.1.1
 * Purpose: Vite config with alias and dev proxy.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v2': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4010',
        changeOrigin: true,
      },
    },
  },
  define: {
    __APP_BUILD_DATE__: JSON.stringify('2025-08-14'),
    __APP_VERSION__: JSON.stringify('0.1.1'),
  },
}))
