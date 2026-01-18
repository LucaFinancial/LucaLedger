import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs/promises';

const stripJsonImportAttributes = () => ({
  name: 'strip-json-import-attributes',
  setup(build) {
    const filter =
      /@luca-financial[\/\\]luca-schema[\/\\]dist[\/\\]esm[\/\\].*\.js$/;
    build.onLoad({ filter }, async (args) => {
      const source = await fs.readFile(args.path, 'utf8');
      const contents = source.replace(
        /\s+with\s*\{\s*type:\s*['"]json['"]\s*\}/g,
        '',
      );
      return { contents, loader: 'js' };
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [stripJsonImportAttributes()],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/', 'dist/'],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
