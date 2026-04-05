import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      manifest: {
        name: 'Orbix Projects',
        short_name: 'Orbix Projects',
        theme_color: '#4F46E5',
        display: 'standalone',
      }
    }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        keep_fnames: true
      },
      mangle: {
        keep_fnames: true
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@admin': '/src/features/admin',
      '@employee': '/src/features/employee',
      '@client': '/src/features/client',
      '@supervisor': '/src/features/supervisor',
    }
  }
})
