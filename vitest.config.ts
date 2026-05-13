import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'packages/*/src/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@compound/shared': path.resolve(__dirname, './packages/shared/src'),
      '@compound/db': path.resolve(__dirname, './packages/db/src'),
      '@compound/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
});
