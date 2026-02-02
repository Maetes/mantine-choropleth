import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Generates .d.ts files for TypeScript support
    dts({
      include: ['src/index.ts', 'src/choropleth/**/*'],
      entryRoot: 'src',
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
    })
  ],
  build: {
    // Library Mode aktivieren
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MantineChoropleth',
      fileName: 'mantine-choropleth',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@mantine/core',
        '@mantine/hooks'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@mantine/core': 'MantineCore',
          '@mantine/hooks': 'MantineHooks'
        },
      },
    },
  },
});
