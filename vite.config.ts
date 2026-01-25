
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // LÓGICA CRÍTICA: Detecta GitHub Actions para definir a subpasta, caso contrário usa raiz
  base: process.env.GITHUB_ACTIONS === 'true' ? '/AlphaBase/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 3000,
  }
})
