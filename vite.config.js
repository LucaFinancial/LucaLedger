import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'http://www.jwaspin.com/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@comp': '/src/components',
      '@feat': '/src/features',
      '@hooks': '/src/hooks',
      '@store': '/src/store',
      '@util': '/src/utils',
    },
  },
});
