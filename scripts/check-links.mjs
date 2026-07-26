import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyRedirects } from '../src/lib/navigation.ts';

const siteUrl = 'https://docs.bugsport.io';
const htmlAttributePattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const linkTagPattern = /<link\b[^>]*>/gi;
const attributePattern = /\b([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

function walkHtml(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => resolve(entry.parentPath, entry.name));
}

function routeForFile(directory, file) {
  const outputPath = relative(directory, file).replaceAll('\\', '/');
  if (outputPath === 'index.html') return '/';
  return `/${outputPath.replace(/\/index\.html$/, '')}`;
}

function candidatesForPath(directory, pathname) {
  const relativePath = pathname.replace(/^\/+/, '');
  const direct = resolve(directory, relativePath);
  const candidates = [direct];

  candidates.push(resolve(direct, 'index.html'));

  return candidates;
}

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function isSameOriginLink(href, sourceRoute) {
  if (href === '' || href.startsWith('#')) return null;
  const target = new URL(href, new URL(sourceRoute, siteUrl));
  return target.origin === siteUrl ? target : null;
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(attributePattern)].map((match) => [
    match[1].toLowerCase(),
    match[2] ?? match[3] ?? match[4] ?? '',
  ]));
}

function canonicalHref(html) {
  for (const tag of html.matchAll(linkTagPattern)) {
    const values = attributes(tag[0]);
    if (values.rel?.split(/\s+/).includes('canonical')) return values.href;
  }
  return undefined;
}

export function checkLinks(directory) {
  const errors = [];
  const root = resolve(directory);

  if (!existsSync(root)) return [`Built output directory does not exist: ${root}`];

  for (const file of walkHtml(root)) {
    const sourceRoute = routeForFile(root, file);
    const html = readFileSync(file, 'utf8');

    for (const match of html.matchAll(htmlAttributePattern)) {
      const href = match[1] ?? match[2] ?? match[3] ?? '';
      const target = isSameOriginLink(href, sourceRoute);
      if (target === null) continue;

      if (!candidatesForPath(root, target.pathname).some(isFile)) {
        errors.push(`${sourceRoute}: ${href} resolves to missing ${target.pathname}`);
      }
    }
  }

  for (const [route, expectedTarget] of Object.entries(legacyRedirects)) {
    const file = resolve(root, route.replace(/^\//, ''), 'index.html');
    if (!isFile(file)) {
      errors.push(`${route}: missing static compatibility page`);
      continue;
    }

    const canonical = canonicalHref(readFileSync(file, 'utf8'));
    const expected = new URL(expectedTarget, siteUrl).href;
    const actual = canonical === undefined ? undefined : new URL(canonical, siteUrl).href;
    if (actual !== expected) {
      errors.push(`${route}: canonical replacement must be ${expectedTarget}, received ${canonical ?? 'none'}`);
    }
  }

  return errors;
}

function main() {
  const directory = resolve(process.cwd(), process.argv[2] ?? 'dist');
  const errors = checkLinks(directory);
  if (errors.length === 0) {
    console.log(`Checked internal links and ${Object.keys(legacyRedirects).length} legacy routes in ${directory}.`);
    return;
  }

  console.error(`Link validation found ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
