import { handleChat } from '../../server/chat.mjs';
export default (request, context) => handleChat(request, { ip: context.ip });
export const config = {
  path: '/api/chat',
  method: 'POST',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: 'ip',
    windowSize: 60,
    windowLimit: 12,
  },
};
