import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@c': '/src/components',
      '@f': '/src/features',
      '@h': '/src/hooks',
      '@s': '/src/store',
      '@u': '/src/utils',
    },
  },
});
