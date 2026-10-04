import { CHAT_ENABLED } from '../../shared/chat-config.mjs';
/** Chat sends only the expressly submitted question and selected language.
 * Journey/pilot answers are never serialized. The panel discloses the server/Groq path.
 */
export const capabilities: { userDataLeavesDevice: boolean } = {
  userDataLeavesDevice: CHAT_ENABLED,
};
