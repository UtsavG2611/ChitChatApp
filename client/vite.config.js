import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
    'process.env': {},
  },
  resolve: {
    alias: {
      // Add alias only if you're using src/ imports like 'src/components/xyz'
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: ['fsevents'],
  },
});