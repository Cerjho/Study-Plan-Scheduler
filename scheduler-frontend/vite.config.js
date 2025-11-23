import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Keep source maps disabled for production
    rollupOptions: {
      output: {
        manualChunks: {
          // Split only the core React dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB to reduce warnings
  },
  server: {
    port: 5173, // Default Vite port
    proxy: {
      // Proxy API requests to Spring Boot backend during development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});