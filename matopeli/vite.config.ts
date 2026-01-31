import { defineConfig } from 'vite'

export default defineConfig({
  base: '/matopeli/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
