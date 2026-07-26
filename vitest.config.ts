import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'astro:content': fileURLToPath(new URL('./tests/astro-content.ts', import.meta.url)),
    },
  },
  test: {
    passWithNoTests: true,
  },
});
