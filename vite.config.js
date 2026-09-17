import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'https://hrms-server-1-hqgk.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
