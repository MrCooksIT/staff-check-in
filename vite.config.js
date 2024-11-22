import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-router-dom': require.resolve('react-router-dom')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['react-router-dom', 'date-fns'],
      output: {
        globals: {
          'date-fns': 'dateFns'
        }
      }
    }
  }
});
