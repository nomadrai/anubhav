import fs from 'node:fs';
import path from 'node:path';
import { KB_CATEGORIES } from '../shared/chat-config.mjs';
import { BANNED_PATTERNS } from '../shared/chat-core.mjs';

export function checkKnowledge(root = process.cwd()) {
  const failures = [],
    warnings = [],
    entries = [],
    ids = new Set();
  for (const category of KB_CATEGORIES) {
    const file = `knowledge/${category}.json`;
    const full = path.join(root, file);
    if (!fs.existsSync(path.join(root, 'knowledge'))) continue; // Existing isolated legacy content fixtures have no KB.
    let data;
    try {
      data = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch {
      failures.push(`${file}: missing/invalid JSON`);
      continue;
    }
    if (!Array.isArray(data) || !data.length) {
      failures.push(`${file}: expected nonempty entries`);
      continue;
    }
    for (const entry of data) {
      const label = `${file} id=${entry.id}`;
      if (!entry.id || ids.has(entry.id))
        failures.push(`${label}: duplicate/missing id`);
      ids.add(entry.id);
      entries.push(entry);
      if (entry.category !== category || entry.status !== 'agent-checked')
        failures.push(`${label}: category/status mismatch`);
      for (const key of ['title_en', 'title_hi', 'text_en', 'text_hi'])
        if (typeof entry[key] !== 'string' || !entry[key].trim())
          failures.push(`${label}: missing ${key}`);
      for (const key of ['aliases', 'related', 'appears_in_steps', 'sources'])
        if (
          !Array.isArray(entry[key]) ||
          entry[key].some((value) => typeof value !== 'string' || !value.trim())
        )
          failures.push(`${label}: invalid ${key}`);
      const text = [
        entry.title_en,
        entry.title_hi,
        entry.text_en,
        entry.text_hi,
        ...(entry.aliases || []),
      ].join(' ');
      const allowances = entry.lintAllow || [];
      for (const allow of allowances)
        if (
          !BANNED_PATTERNS.some(([name]) => name === allow.pattern) ||
          typeof allow.reason !== 'string' ||
          allow.reason.length < 20
        )
          failures.push(`${label}: invalid lintAllow explanation`);
      for (const [name, regex] of BANNED_PATTERNS)
        if (
          regex.test(text) &&
          !allowances.some(
            (allow) => allow.pattern === name && allow.reason.length >= 20,
          )
        )
          failures.push(
            `${label}: banned pattern ${name} requires entry-specific explanatory/warning reason`,
          );
      for (const url of entry.sources || []) {
        try {
          const parsed = new globalThis.URL(url);
          if (parsed.protocol !== 'https:') throw new Error();
        } catch {
          failures.push(`${label}: invalid source URL`);
        }
      }
      warnings.push(`${label}: agent-checked; not human/native-reviewed`);
    }
  }
  for (const entry of entries)
    for (const id of entry.related || [])
      if (!ids.has(id))
        failures.push(
          `knowledge/${entry.category}.json id=${entry.id}: missing related ${id}`,
        );
  return { failures, warnings, entries };
}
