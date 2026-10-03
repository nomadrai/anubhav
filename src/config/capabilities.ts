/** Privacy-copy capability, not a transport implementation. Never serialize journey inputs.
 * Enabling a sending feature also requires its own explicit disclosure, guardrail review,
 * and new network tests; flipping this flag does not authorize external requests.
 */
export const capabilities: { userDataLeavesDevice: boolean } = {
  userDataLeavesDevice: false,
};
