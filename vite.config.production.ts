import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuration Vite pour production avec clés Stripe forcées
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: false,
  },
  define: {
    // Forcer les variables d'environnement de production
    'import.meta.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS'),
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});