import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // ─── Dev proxy: forward /api/* requests to Spring Boot backend ───
  server: {
    host: true,   // listen on 0.0.0.0 — resolves both localhost and 127.0.0.1
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
