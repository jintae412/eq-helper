import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/eq-helper/', // GitHub Pages project path: jintae412.github.io/eq-helper/
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EQ Helper',
        short_name: 'EQ Helper',
        description: 'Live EQ advice from your mic. Works offline.',
        display: 'standalone',
        background_color: '#111111',
        theme_color: '#111111',
        // ponytail: SVG icon only; iOS home screen wants a 180px PNG apple-touch-icon, add before sharing
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
    }),
  ],
  test: { environment: 'node' },
});
