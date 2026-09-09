import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind IPv6-any with dual-stack rather than Vite's default 'localhost'.
    // On Windows that default resolves to [::1] only, so 127.0.0.1:5173 refuses
    // connections and any tool that prefers IPv4 — embedded preview panes,
    // some browsers — sees a dead server. '::' accepts both stacks, and also
    // makes the dev server reachable from a phone on the same network.
    host: '::',
    port: 5173,
    strictPort: true,
  },
  // Playwright waits on http://127.0.0.1:4173 before it starts a run. Pinning
  // the host and port here rather than relying on Vite's defaults means the
  // e2e job cannot hang on a preview server that came up somewhere else.
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome111',
  },
})
