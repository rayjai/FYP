import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    target: 'esnext' // Change this to 'esnext' or a version that supports top-level await
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    proxy: {
      '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
},

})
