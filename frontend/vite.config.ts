import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const mitmwebUrl = env.VITE_MITMWEB_URL || 'http://127.0.0.1:8081'
  const mitmwebWsUrl = mitmwebUrl.replace(/^http/, 'ws')

  return {
    base: './',
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/flows': mitmwebUrl,
        '/options': mitmwebUrl,
        '/clear': mitmwebUrl,
        '/state': mitmwebUrl,
        '/commands': mitmwebUrl,
        '/events': mitmwebUrl,
        '/filter-help': mitmwebUrl,
        '/updates': { target: mitmwebWsUrl, ws: true },
      },
    },
  }
})
