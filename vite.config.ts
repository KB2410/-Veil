import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';

export default defineConfig({
  define: { global: 'globalThis' },
  resolve: {
    alias: {
      process: 'process/browser', buffer: 'buffer', util: 'util', stream: 'stream-browserify', events: 'events', assert: 'assert',
      'isomorphic-ws': path.resolve(__dirname, 'src/midnight/websocket.ts'),
    },
  },
  plugins: [
    react(), wasm(),
    viteStaticCopy({ targets: [{ src: 'managed/veil_feedback', dest: 'contract' }] }),
  ],
  optimizeDeps: { include: ['level', 'browser-level', 'abstract-level', 'level-supports', 'level-transcoder'] },
  build: { target: 'esnext' },
  server: {
    port: 3000,
    host: true,
  }
});
