import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Environment variables configuration
  define: {
    // Expose all VITE_* env vars to the browser
    __VITE_SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL),
    __VITE_SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
  
  // Build configuration
  build: {
    minify: 'terser',
    sourcemap: false, // Set to true for debugging in production
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'recharts': ['recharts'],
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    strictPort: false,
    host: true, // Listen on all network interfaces
    // CORS proxy for Supabase (development only)
    proxy: {
      '/api': {
        target: process.env.VITE_SUPABASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
