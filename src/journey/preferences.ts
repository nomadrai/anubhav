/** The only application preferences permitted to persist. Journey answers never enter storage. */
export function readPreference(key: 'language' | 'auto-speak') {
  try {
    return window.localStorage.getItem(`learning.${key}`);
  } catch {
    return null;
  }
}
export function savePreference(key: 'language' | 'auto-speak', value: string) {
  try {
    window.localStorage.setItem(`learning.${key}`, value);
  } catch {
    /* Storage may be disabled. */
  }
}
/** Remove only the retired app-owned key, not unrelated site data. */
export function removeLegacyTextSizePreference() {
  try {
    window.localStorage.removeItem('learning.text-size');
  } catch {
    /* Fixed text sizing also works with storage disabled. */
  }
}
