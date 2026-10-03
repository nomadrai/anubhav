/* global self, caches */
// Scope cleanup to this app's obsolete audio caches; never erase another app's data.
self.addEventListener('activate', (event) => {
  const keep = new Set(['learning-audio-v2', 'learning-audio-manifest-v2']);
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith('learning-audio-') && !keep.has(key))
    .map((key) => caches.delete(key)))));
});
