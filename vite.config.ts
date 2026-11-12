import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base: './'` keeps the build portable: it works at a domain root (Vercel, Netlify)
// and under a sub-path (GitHub Pages) without further configuration.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: false },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1400,
  },
})
