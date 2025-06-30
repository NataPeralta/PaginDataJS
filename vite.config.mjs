import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  const isDeepBuild = process.env.npm_lifecycle_event === 'build:deep';

  return {
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'Pagination',
        fileName: () => {
          return isDeepBuild ? 'index.min.js' : 'index.js';
        },
        formats: ['es'],
      },
      outDir: 'dist',
      minify: isDeepBuild ? 'terser' : false,
      rollupOptions: {
        external: [],
        output: {
          globals: {},
        },
        ...(isDeepBuild && {
          plugins: [
            // Configuración adicional para build profundo
          ]
        })
      },
      ...(isDeepBuild && {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          mangle: true,
        }
      })
    },
    server: {
      port: 5173
    },
  };
}); 