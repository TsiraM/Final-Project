import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: false, // Disable source maps in development
  },

  server: {
    proxy: {
      '/products': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    sourcemap: false, // Ensures esbuild doesn't generate source maps for development
  },
  optimizeDeps: {
    sourcemap: false, // Ensures dependencies don’t generate source maps
  },
});
