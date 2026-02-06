import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 800,
    // Minification with esbuild (built-in, faster than terser)
    minify: 'esbuild',
    // Asset optimization
    assetsInlineLimit: 4096,
    // Enable source maps for debugging (disable in prod if needed)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller bundles
    target: 'es2020',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', '@supabase/supabase-js'],
  },
  // Server optimization
  server: {
    warmup: {
      clientFiles: ['./src/App.jsx', './src/main.jsx'],
    },
  },
})
