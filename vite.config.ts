import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/annoArda/',
  build: {
    outDir: 'dist',
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
})