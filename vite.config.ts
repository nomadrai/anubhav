import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Registration is intentionally disabled until the offline strategy is implemented.
    VitePWA({ registerType: 'autoUpdate', injectRegister: null, disable: true }),
    ...(mode === 'production' ? [{
      name: 'production-csp',
      transformIndexHtml(html: string) { return html.replace('</head>', '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; connect-src \'self\'">\n</head>'); },
    }] : []),
  ],
  define: mode === 'production' ? {} : undefined,
}));
