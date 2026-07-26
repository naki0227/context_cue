import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'import.meta.env.VITE_CONTEXT_CUE_LAUNCH_MODE': JSON.stringify('user'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['./test/user-launch.test.tsx'],
    setupFiles: ['./test/setup.ts'],
  },
});
