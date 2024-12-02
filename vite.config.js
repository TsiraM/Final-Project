import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/products': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});