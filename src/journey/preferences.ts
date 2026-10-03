/** The only application preferences permitted to persist. Journey answers never enter storage. */
export function readPreference(key: 'language' | 'text-size') {
  try {
    return window.localStorage.getItem(`learning.${key}`);
  } catch {
    return null;
  }
}
export function savePreference(key: 'language' | 'text-size', value: string) {
  try {
    window.localStorage.setItem(`learning.${key}`, value);
  } catch {
    /* Storage may be disabled. */
  }
}
