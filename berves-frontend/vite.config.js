import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget =
    env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8000';
  const devPort = Number(env.VITE_DEV_SERVER_PORT || process.env.PORT || 3000);
  // Use the same host you open in the browser (localhost vs 127.0.0.1); mixing them breaks HMR on Windows.
  const devHost = env.VITE_DEV_SERVER_HOST || 'localhost';
  // Default strict: if the port is taken, fail fast instead of jumping to 3001/3002 (HMR/WebSocket then often desyncs).
  const strictPort = env.VITE_DEV_SERVER_STRICT_PORT !== 'false';

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(process.cwd(), 'src') },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
    },
    server: {
      host: devHost,
      port: devPort,
      strictPort,
      // When strictPort is false, Vite may bind another port — only pin HMR ports when the dev port is fixed.
      hmr: strictPort
        ? { host: devHost, port: devPort, clientPort: devPort }
        : { host: devHost },
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
