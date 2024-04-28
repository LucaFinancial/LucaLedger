import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@comp': '/src/components',
      '@feat': '/src/features',
      '@hook': '/src/hooks',
      '@store': '/src/store',
      '@util': '/src/utils',
    },
  },
});
