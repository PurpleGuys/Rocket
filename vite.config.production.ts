import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  // Force production Stripe key
  process.env.VITE_STRIPE_PUBLIC_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';
  
  // Load env file
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Force inject Stripe key
      'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS'),
      'process.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS'),
    },
    envPrefix: 'VITE_',
    publicDir: 'public',
    build: {
      outDir: 'dist/public',
      emptyOutDir: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './client/src'),
        '@assets': path.resolve(__dirname, './attached_assets'),
        '@shared': path.resolve(__dirname, './shared'),
        '@/lib': path.resolve(__dirname, './client/src/lib'),
        '@/components': path.resolve(__dirname, './client/src/components'),
        '@/pages': path.resolve(__dirname, './client/src/pages'),
        '@/hooks': path.resolve(__dirname, './client/src/hooks'),
      }
    }
  };
});