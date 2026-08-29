import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@citymind/constants': path.resolve(__dirname, '../../packages/constants/src'),
      '@citymind/utilities': path.resolve(__dirname, '../../packages/utilities/src'),
      '@citymind/game-engine': path.resolve(__dirname, '../../packages/game-engine/src'),
      '@citymind/simulation-core': path.resolve(__dirname, '../../packages/simulation-core/src')
    }
  },
  server: { port: 3000, host: true },
  optimizeDeps: { include: [] }
});
