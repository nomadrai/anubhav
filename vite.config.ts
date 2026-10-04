/* global self */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { APP_NAME } from './src/config/app';
import { chatPlugin } from './server/vite-chat.mjs';

const csp =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    chatPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: [
        'icons/icon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
      ],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f7f1e8',
        theme_color: '#f7f1e8',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        importScripts: ['/cache-cleanup.js'],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        globIgnores: ['audio/**'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/audio\//, /^\/api\//, /^\/knowledge\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/knowledge\/(?:app|basics|products|behaviour|fraud|doubts)\.json$/.test(
                url.pathname,
              ),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'learning-knowledge-v1',
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 6 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname === '/audio/manifest.json',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'learning-audio-manifest-v2',
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/audio\/(en|hi)\/[a-f0-9]{64}\.opus$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'learning-audio-v2',
              cacheableResponse: { statuses: [200] },
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
                purgeOnQuotaError: true,
              },
            },
          },
        ],
      },
    }),
    ...(mode === 'production'
      ? [
          {
            name: 'production-csp',
            transformIndexHtml(html: string) {
              return html.replace(
                '</head>',
                `<meta http-equiv="Content-Security-Policy" content="${csp}">\n</head>`,
              );
            },
          },
        ]
      : []),
  ],
  preview: {
    headers: {
      'Content-Security-Policy': `${csp}; frame-ancestors 'none'`,
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    },
  },
}));
