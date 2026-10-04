// Vercel serverless function — portable adapter for server/chat.mjs
// Bridges Vercel's Node.js req/res to the Web Request/Response API used by handleChat.
import { handleChat } from '../server/chat.mjs';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method' });
    return;
  }

  // Reconstruct a minimal Web Request from the Vercel Node.js req
  const protocol = req.headers['x-forwarded-proto'] ?? 'https';
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost';
  const url = `${protocol}://${host}${req.url}`;

  // Buffer the body and rebuild it as a ReadableStream
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const webRequest = new Request(url, {
    method: 'POST',
    headers: new Headers(req.headers),
    body,
    // AbortSignal from the connection close
    signal: AbortSignal.timeout(12000),
  });

  // Vercel passes the real IP via x-forwarded-for; take only the first entry.
  const xff = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim() ?? 'unknown';

  const webResponse = await handleChat(webRequest, { ip });

  // Forward status, headers and body back to Vercel
  res.status(webResponse.status);
  for (const [key, value] of webResponse.headers.entries()) {
    res.setHeader(key, value);
  }
  const responseBody = await webResponse.text();
  res.send(responseBody);
}
