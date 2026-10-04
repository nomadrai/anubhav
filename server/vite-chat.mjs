import fs from 'node:fs';
import { loadEnv } from 'vite';
import { handleChat } from './chat.mjs';
import { KB_CATEGORIES } from '../shared/chat-config.mjs';

export function chatPlugin() {
  const install = (server) => {
    // Vite's browser env handling does not populate server-only process.env keys.
    const env = loadEnv(server.config.mode, server.config.envDir, 'GROQ_API_KEY');
    if (!process.env.GROQ_API_KEY && env.GROQ_API_KEY)
      process.env.GROQ_API_KEY = env.GROQ_API_KEY;
    server.middlewares.use(async (req, res, next) => {
      const path = req.url?.split('?')[0];
      if (path?.startsWith('/knowledge/')) {
        const category = path
          .slice('/knowledge/'.length)
          .replace(/\.json$/, '');
        if (!KB_CATEGORIES.includes(category) || req.method !== 'GET') {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(
          fs.readFileSync(
            new globalThis.URL(
              `../knowledge/${category}.json`,
              import.meta.url,
            ),
          ),
        );
        return;
      }
      if (path !== '/api/chat') return next();
      try {
        let body = '',
          size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4096) {
            res.statusCode = 413;
            res.end();
            return;
          }
          body += chunk.toString();
        }
        const request = new globalThis.Request(
          `http://${req.headers.host}${req.url}`,
          {
            method: req.method,
            headers: Object.fromEntries(
              Object.entries(req.headers).filter(
                ([, value]) => typeof value === 'string',
              ),
            ),
            ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body } : {}),
          },
        );
        const response = await handleChat(request, {
          ip: req.socket.remoteAddress || 'local',
        });
        res.statusCode = response.status;
        response.headers.forEach((value, name) => res.setHeader(name, value));
        res.end(await response.text());
      } catch {
        res.statusCode = 400;
        res.end();
      }
    });
  };
  return {
    name: 'same-origin-learning-chat',
    configureServer: install,
    configurePreviewServer: install,
    generateBundle() {
      for (const category of KB_CATEGORIES)
        this.emitFile({
          type: 'asset',
          fileName: `knowledge/${category}.json`,
          source: fs.readFileSync(
            new globalThis.URL(
              `../knowledge/${category}.json`,
              import.meta.url,
            ),
            'utf8',
          ),
        });
    },
  };
}
