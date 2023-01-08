import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/data-center/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
});
