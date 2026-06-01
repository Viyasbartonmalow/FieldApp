import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, existsSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-deployment-files',
      writeBundle() {
        // Copy deployment files to dist after build
        const srcConfig = path.resolve(__dirname, 'src', 'amplifyconfiguration.json')
        const distConfig = path.resolve(__dirname, 'dist', 'amplifyconfiguration.json')
        const publicWebConfig = path.resolve(__dirname, 'public', 'web.config')
        const distWebConfig = path.resolve(__dirname, 'dist', 'web.config')
        
        if (existsSync(srcConfig)) {
          copyFileSync(srcConfig, distConfig)
          console.log('[vite] ✓ Copied amplifyconfiguration.json to dist')
        }
        if (existsSync(publicWebConfig)) {
          copyFileSync(publicWebConfig, distWebConfig)
          console.log('[vite] ✓ Copied web.config to dist')
        }
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    publicDir: 'public',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      // Points to the Amplify-generated config at the workspace root src/
      '@aws-exports': path.resolve(__dirname, '../src/aws-exports'),
    },
  },
})
