import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Все запросы, начинающиеся с /api, Vite перенаправит на бэкенд
      '/api': {
        target: 'https://localhost:7200', // Укажи здесь адрес своего работающего бэкенда
        changeOrigin: true,
        secure: false, // Разрешаем работу с самоподписанными сертификатами на localhost
      },
    },
  },
})
