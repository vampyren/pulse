
/* Pulse Web — vite.config.ts
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Vite config with React plugin and API proxy.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev proxy so API calls to /api/v2 go to the backend (no CORS headaches)
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
