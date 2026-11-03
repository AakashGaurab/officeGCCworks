/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The backend allows CORS from http://localhost:5173 by default, so the dev port must stay 5173.
const DEV_SERVER_PORT = 5173;

// Under a parallel, loaded run a slow test can pass the default 5000 ms; this is only headroom.
const TEST_TIMEOUT_MS = 10000;

export default defineConfig({
  plugins: [react()],
  server: { port: DEV_SERVER_PORT, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.ts'],
    css: false,
    testTimeout: TEST_TIMEOUT_MS,
  },
});
