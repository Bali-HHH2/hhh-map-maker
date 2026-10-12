import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // `bun run api` serves the Pages Functions here.
    proxy: { '/api': 'http://localhost:8788' }
  }
})
