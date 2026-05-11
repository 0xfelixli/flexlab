import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const MITMPROXY_URL = 'http://127.0.0.1:8081'
const MITMPROXY_WS_URL = 'ws://127.0.0.1:8081'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/flows': MITMPROXY_URL,
      '/options': MITMPROXY_URL,
      '/clear': MITMPROXY_URL,
      '/state': MITMPROXY_URL,
      '/commands': MITMPROXY_URL,
      '/events': MITMPROXY_URL,
      '/filter-help': MITMPROXY_URL,
      '/updates': { target: MITMPROXY_WS_URL, ws: true },
    },
  },
})
