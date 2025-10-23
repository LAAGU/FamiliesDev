import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          base: '/',
          build: {
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
              output: {
                assetFileNames: '[name][extname]',
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                manualChunks(id) {
                  // Split node_modules into separate chunks
                  if (id.includes('node_modules')) {
                    if (id.includes('react')) return 'vendor-react'
                    if (id.includes('firebase')) return 'vendor-firebase'
                    if (id.includes('discord-rpc')) return 'vendor-discord'
                    return 'vendor'
                  }
                },
              },
              external: [
                'firebase-admin',
                '@google-cloud/firestore',
                'grpc',
                'bytes',
                'discord-rpc',
              ],
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
})
