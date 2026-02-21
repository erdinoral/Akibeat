import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  build: {
    outDir: '../dist-frontend',
    emptyOutDir: true,
  },
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend/src'),
    },
  },
  server: {
    port: 5173,
  },
});
