import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  return {
    base: isProduction ? '/ahorrapp/' : '/',
    plugins: [react(), tailwindcss()],
  }
})
