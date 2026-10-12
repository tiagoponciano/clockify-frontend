import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
    // Date helpers mix local-time and America/Sao_Paulo math; pin the zone so results are deterministic.
    env: { TZ: 'America/Sao_Paulo' },
  },
});
