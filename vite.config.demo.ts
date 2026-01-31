import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/mantine-choropleth/', // GitHub Pages base path
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Allow the demo to import from the library source during development
      'mantine-choropleth': resolve(__dirname, 'src/index.ts'),
    },
  },
});
