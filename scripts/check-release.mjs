import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, URL } from 'node:url';
import ts from 'typescript';
import { checkContent } from './check-content.mjs';
import { sha256 } from './check-audio.mjs';
import { validateEpisode } from '../src/data/episodes/episode.schema.ts';

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/** Fail closed on unfamiliar registry shapes; never scan test-only JSON as shipped data. */
export function productionEpisodeFiles(root, failures) {
  const registry = path.join(root, 'src/data/episodes/index.ts');
  if (!fs.existsSync(registry)) { failures.push('src/data/episodes/index.ts: production registry missing'); return []; }
  const source = ts.createSourceFile(registry, fs.readFileSync(registry, 'utf8'), ts.ScriptTarget.Latest, true);
  const imports = new Map();
  let initializer;
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text.endsWith('.json') && statement.importClause?.name) {
      imports.set(statement.importClause.name.text, path.resolve(path.dirname(registry), statement.moduleSpecifier.text));
    }
    if (ts.isVariableStatement(statement) && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name) && declaration.name.text === 'episodes') initializer = declaration.initializer;
    }
  }
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) { failures.push('src/data/episodes/index.ts: episodes must be an explicit production array'); return []; }
  const files = [];
  for (const element of initializer.elements) {
    // Supported contract: imported JSON directly, or load('file-id', importedJson).
    const data = ts.isIdentifier(element) ? element : ts.isCallExpression(element) && ts.isIdentifier(element.expression) && element.expression.text === 'load' && element.arguments.length === 2 ? element.arguments[1] : undefined;
    const file = data && ts.isIdentifier(data) ? imports.get(data.text) : undefined;
    if (!file || !file.startsWith(`${path.resolve(root, 'src/data/episodes')}${path.sep}`)) failures.push('src/data/episodes/index.ts: unresolved production episode entry');
    else files.push(file);
  }
  if (!files.length) failures.push('src/data/episodes/index.ts: no production episodes');
  return [...new Set(files)];
}

export function checkRelease(root = process.cwd()) {
  const content = checkContent(root);
  const failures = [...content.failures];
  const warnings = [...content.warnings];
  const shippedEpisodes = productionEpisodeFiles(root, failures);
  const episodeIds = new Set();
  const inspect = (value, file, location = '$') => {
    if (Array.isArray(value)) value.forEach((child, index) => inspect(child, file, `${location}[${index}]`));
    else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        if (key === 'isPlaceholder' && child === true) failures.push(`${file} ${location}: placeholder episode is not shippable`);
        if (key === 'verified' && child !== true) failures.push(`${file} ${location}: unverified resource is not shippable`);
        if (key === 'status' && ['draft', 'planned'].includes(child)) failures.push(`${file} ${location}: ${child} content is not shippable`);
        inspect(child, file, `${location}.${key}`);
      }
    } else if (typeof value === 'string' && value.includes('TODO(human)')) failures.push(`${file} ${location}: unresolved TODO(human)`);
  };
  for (const file of shippedEpisodes) {
    const relative = path.relative(root, file);
    try {
      const value = JSON.parse(fs.readFileSync(file, 'utf8'));
      const episode = validateEpisode(value);
      if (episodeIds.has(episode.id)) failures.push(`${relative}: duplicate production episode id ${episode.id}`);
      episodeIds.add(episode.id);
      inspect(value, relative);
      if (!['agent-checked', 'reviewed'].includes(value.status) || value.provenance?.review?.status !== value.status) failures.push(`${relative}: missing or mismatched episode review status`);
      for (const [field, translations] of [['reveal.periodText', value.reveal.periodText], ['reveal.whatHappenedText', value.reveal.whatHappenedText], ['sourceLabel', value.sourceLabel]]) {
        for (const language of ['en', 'hi']) {
          const text = translations?.[language];
          const label = `${relative} $.${field}.${language} id=${episode.id}.${field} language=${language}`;
          if (typeof text !== 'string' || value.provenance?.review?.contentSha256?.[`${field}.${language}`] !== sha256(text)) failures.push(`${label}: missing or stale episode copy review hash`);
          if (value.status === 'agent-checked') warnings.push(`AGENT-CHECKED STRING (not human/native-reviewed): ${label}`);
        }
      }
    } catch (error) { failures.push(`${relative}: invalid production episode (${error.message})`); }
  }
  const config = path.join(root, 'src/config/episodes.ts');
  const defaultId = fs.existsSync(config) ? fs.readFileSync(config, 'utf8').match(/export\s+const\s+DEFAULT_EPISODE_ID\s*=\s*['"]([^'"]+)['"]/u)?.[1] : undefined;
  if (!defaultId || !episodeIds.has(defaultId)) failures.push('src/config/episodes.ts: default episode is not in the production registry');
  for (const file of walk(path.join(root, 'src/content')).filter((file) => file.endsWith('.json') && !file.endsWith('lint-allowlist.json') && !file.endsWith('review-status.json'))) {
    const relative = path.relative(root, file);
    try {
      const value = JSON.parse(fs.readFileSync(file, 'utf8'));
      inspect(value, relative);
      if (file.endsWith('resources.json')) {
        if (!Array.isArray(value)) failures.push(`${relative}: resources must be an array`);
        else for (const resource of value) {
          if (resource.verified !== true) failures.push(`${relative} id=${resource.id}: unverified resource`);
          try { const url = new URL(resource.url); if (url.protocol !== 'https:' || url.username || url.password) throw new Error(); }
          catch { failures.push(`${relative} id=${resource.id}: invalid HTTPS resource URL`); }
          const checkedDate = new Date(resource.checkedOn);
          if (!/^\d{4}-\d{2}-\d{2}$/u.test(resource.checkedOn ?? '') || !Number.isFinite(checkedDate.getTime()) || checkedDate.toISOString().slice(0, 10) !== resource.checkedOn) failures.push(`${relative} id=${resource.id}: missing or invalid verification date`);
          for (const field of ['record', 'observed', 'scope']) {
            if (typeof resource.evidence?.[field] !== 'string' || !resource.evidence[field].trim()) failures.push(`${relative} id=${resource.id}: missing verification evidence ${field}`);
          }
        }
      }
    } catch { failures.push(`${relative}: invalid JSON`); }
  }
  for (const file of walk(path.join(root, 'src'))) {
    if (!/\.(?:ts|tsx)$/u.test(file) || /(?:\.test\.|\/__tests__\/|\/fixtures\/)/u.test(file.replaceAll(path.sep, '/'))) continue;
    if (fs.readFileSync(file, 'utf8').includes('TODO(human)')) failures.push(`${path.relative(root, file)}: unresolved TODO(human)`);
  }
  return { failures: [...new Set(failures)], warnings: [...new Set(warnings)] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = checkRelease();
  result.warnings.forEach((warning) => console.warn(`WARNING: ${warning}`));
  if (result.failures.length) {
    console.error('Release blocked by:');
    result.failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  } else console.log('Release checks passed; any agent-checked strings are individually warned above.');
}
