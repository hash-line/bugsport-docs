import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { legacyRedirects } from '@/lib/navigation';

const fixtures: string[] = [];

function makeFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'bugsport-link-check-'));
  fixtures.push(directory);
  return directory;
}

function writePage(directory: string, route: string, html: string) {
  const target = join(directory, route.replace(/^\//, ''), 'index.html');
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, html);
}

function check(directory: string) {
  return spawnSync(process.execPath, ['scripts/check-links.mjs', directory], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

afterEach(() => {
  for (const directory of fixtures.splice(0)) rmSync(directory, { force: true, recursive: true });
});

describe('built-output link validation', () => {
  it('reports every missing same-origin target while accepting routes, Markdown, assets, fragments, external schemes, and static API output', () => {
    const directory = makeFixture();
    writePage(directory, '/', `
      <a href="/docs">Docs</a>
      <a href="/docs/">Docs slash</a>
      <a href="/docs/index.html">Docs file</a>
      <a href="/docs/index.md">Docs Markdown</a>
      <a href="/api/search">Search API</a>
      <a href="/docs#intro">Docs fragment</a>
      <a href="#local">Local fragment</a>
      <a href="https://example.com">External</a>
      <a href="//example.com">Protocol-relative external</a>
      <a href="//docs.bugsport.io/missing-three">Protocol-relative same origin</a>
      <a href="mailto:docs@example.com">Email</a>
      <a href="tel:+10000000000">Phone</a>
      <a href="data:text/plain,docs">Data</a>
      <a href="/missing-one">Missing one</a>
      <a href="/missing-two">Missing two</a>
    `);
    writePage(directory, '/docs', '<h1 id="intro">Docs</h1>');
    writePage(directory, '/api/search', 'Search');
    mkdirSync(join(directory, 'docs'), { recursive: true });
    writeFileSync(join(directory, 'docs', 'index.md'), '# Docs');
    writeFileSync(join(directory, 'favicon.svg'), '<svg />');

    const result = check(directory);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('/missing-one');
    expect(result.stderr).toContain('/missing-two');
    expect(result.stderr).toContain('/missing-three');
    expect(result.stderr).not.toContain('example.com');
    expect(result.stderr).not.toContain('mailto:');
    expect(result.stderr).not.toContain('/api/search');
  });

  it('validates the canonical target for every declared legacy route', () => {
    const directory = makeFixture();

    for (const [route, target] of Object.entries(legacyRedirects)) {
      writePage(directory, route, `<link rel="canonical" href="${target}">`);
    }
    writePage(directory, '/docs/quickstart', '<link rel="canonical" href="/docs/get-started">');

    const result = check(directory);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('/docs/quickstart');
    expect(result.stderr).toContain('/docs/get-started/first-issue');
  });
});
