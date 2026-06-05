import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import manifest from './manifest.json' with { type: 'json' }

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const browser = mode === 'firefox' ? 'firefox' : 'chrome'

  // Construct dynamic manifest data based on target browser
  const manifestData = { ...manifest }
  if (browser === 'firefox') {
    manifestData.background = {
      scripts: ['src/background/index.ts'],
      type: 'module',
    } as any
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      crx({ manifest: manifestData, browser }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      cors: {
        origin: [/^https?:\/\/localhost:\d+$/, /^chrome-extension:\/\/[a-z]+$/],
      },
    },
    build: {
      outDir: `dist/${browser}`,
      sourcemap: isDev,
      minify: !isDev,
      target: browser === 'firefox' ? 'firefox109' : 'chrome110',
    },
  }
})
