
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Fix: Define __dirname for ESM environments using fileURLToPath to avoid "Cannot find name '__dirname'" error
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  // LÓGICA DE DEPLOY: Define a base conforme o ambiente do GitHub Actions
  base: process.env.GITHUB_ACTIONS === 'true' ? '/AlphaBase/' : '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api-proxy': {
        target: 'https://api.convex.dev/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  }
})
