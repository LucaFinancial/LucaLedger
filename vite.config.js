import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://storage.googleapis.com/luca-ledger-dev-web-app-bucket/',
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
