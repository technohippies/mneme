import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { writeFileSync } from 'fs';

// Custom plugin to generate _redirects file
const generateRedirects = () => {
  return {
    name: 'generate-redirects',
    closeBundle() {
      writeFileSync('dist/_redirects', '/* /index.html 200');
    }
  };
};

export default defineConfig({
  plugins: [react(), generateRedirects()],
  optimizeDeps: {
    exclude: ["@xmtp/user-preferences-bindings-wasm"],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
