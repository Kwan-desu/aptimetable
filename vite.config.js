import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api/weektimetable': {
        target: 'https://s3-ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        rewrite: () => '/open-ws/weektimetable'
      }
    }
  }
});
