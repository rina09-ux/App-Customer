import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const required = ['VITE_NUSASEC_CORE_URL', 'VITE_NUSASEC_AI_URL', 'VITE_NUSASEC_INTERNAL_URL', 'VITE_NUSASEC_PUBLIC_URL'];
  if (isProduction) {
    const missing = required.filter((key) => !env[key]);
    if (missing.length) {
      throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
    }
  }

  return {
    base: env.VITE_BASE_PATH || './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: env.DISABLE_HMR !== 'true',
      watch: env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
