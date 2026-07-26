import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { docsSchema } from '../src/lib/docs-schema';
import { generateOpenApi } from '../scripts/generate-openapi.mjs';
import { getCheckoutArgument, normalizeOpenApi, syncOpenApi } from '../scripts/sync-openapi.mjs';

const root = resolve(process.cwd());
const snapshotPath = join(root, 'openapi/bugsport.json');
const metadataPath = join(root, 'openapi/source.json');
const sourceDigest = 'fdee88614b8222e2e92ce54f97a6292c01a0af1595aaca8ac3e3d19c4d7b6161';
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('OpenAPI snapshot', () => {
  it('accepts generated OpenAPI frontmatter but rejects unknown top-level fields', () => {
    expect(docsSchema.safeParse({
      title: 'Generated endpoint',
      full: true,
      _openapi: {
        preload: ['./openapi/bugsport.json'],
        method: 'POST',
        webhook: false,
        toc: [],
        structuredData: { headings: [], contents: [] },
      },
    }).success).toBe(true);
    expect(docsSchema.safeParse({ title: 'Hand-authored page', unintended: true }).success).toBe(false);
  });

  it('accepts pnpm’s forwarded argument delimiter', () => {
    expect(getCheckoutArgument(['node', 'scripts/sync-openapi.mjs', '--', '/tmp/bugsport'])).toBe('/tmp/bugsport');
  });

  it('records the exact contract source and its raw-byte digest', async () => {
    const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));

    expect(metadata).toMatchObject({
      repository: 'hash-line/bugsport',
      path: 'packages/contracts/openapi.json',
      commit: 'cbd9954e8a1b26cd3b507a2f7eff84c5062ec0ce',
      sha256: sourceDigest,
    });
    expect(metadata.synchronizedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('documents project API-key authentication', async () => {
    const schema = JSON.parse(await readFile(snapshotPath, 'utf8'));

    expect(schema.components.securitySchemes.ApiKeyAuth).toMatchObject({
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
    });
  });

  it('contains the issue ingestion route', async () => {
    const schema = JSON.parse(await readFile(snapshotPath, 'utf8'));

    expect(schema.paths['/v1/projects/{projectId}/issues'].post).toBeDefined();
  });

  it('preserves the synchronized timestamp when an identical contract is synced twice', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'bugsport-openapi-'));
    temporaryDirectories.push(directory);
    const sourcePath = join(directory, 'openapi.json');
    const outputDirectory = join(directory, 'snapshot');
    const source = JSON.stringify({
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Fixture API' },
      paths: {
        '/v1/fixtures': {
          post: {
            responses: { '204': { description: 'No content' } },
            tags: ['fixtures', 'write'],
          },
        },
      },
    });
    await writeFile(sourcePath, source);

    await syncOpenApi(sourcePath, 'a'.repeat(40), {
      outputDirectory,
      synchronizedAt: '2026-07-26T00:00:00.000Z',
    });
    const firstMetadata = await readFile(join(outputDirectory, 'source.json'), 'utf8');

    await syncOpenApi(sourcePath, 'a'.repeat(40), {
      outputDirectory,
      synchronizedAt: '2026-07-26T00:01:00.000Z',
    });
    const secondMetadata = await readFile(join(outputDirectory, 'source.json'), 'utf8');
    const snapshot = JSON.parse(await readFile(join(outputDirectory, 'bugsport.json'), 'utf8'));

    expect(secondMetadata).toBe(firstMetadata);
    expect(snapshot.paths['/v1/fixtures'].post.tags).toEqual(['fixtures', 'write']);
    expect(JSON.parse(secondMetadata).sha256).toBe(createHash('sha256').update(source).digest('hex'));
  });

  it('converges a formatting-only snapshot to canonical bytes without changing its timestamp', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'bugsport-openapi-canonical-'));
    temporaryDirectories.push(directory);
    const sourcePath = join(directory, 'openapi.json');
    const outputDirectory = join(directory, 'snapshot');
    const source = '{"openapi":"3.1.0","info":{"title":"Fixture API","version":"1.0.0"},"paths":{"/v1/fixtures":{"post":{"responses":{"204":{"description":"No content"}},"tags":["fixtures","write"]}}}}';
    const nonCanonicalSnapshot = `{
    "paths": {
        "/v1/fixtures": {
            "post": {
                "tags": [
                    "fixtures",
                    "write"
                ],
                "responses": {
                    "204": {
                        "description": "No content"
                    }
                }
            }
        }
    },
    "openapi": "3.1.0",
    "info": {
        "version": "1.0.0",
        "title": "Fixture API"
    }
}\n`;
    const canonicalSnapshot = `{
  "info": {
    "title": "Fixture API",
    "version": "1.0.0"
  },
  "openapi": "3.1.0",
  "paths": {
    "/v1/fixtures": {
      "post": {
        "responses": {
          "204": {
            "description": "No content"
          }
        },
        "tags": [
          "fixtures",
          "write"
        ]
      }
    }
  }
}\n`;
    const existingMetadata = {
      repository: 'hash-line/bugsport',
      path: 'packages/contracts/openapi.json',
      commit: 'b'.repeat(40),
      sha256: createHash('sha256').update(source).digest('hex'),
      synchronizedAt: '2026-07-26T00:00:00.000Z',
    };
    await writeFile(sourcePath, source);
    await mkdir(outputDirectory);
    await writeFile(join(outputDirectory, 'bugsport.json'), nonCanonicalSnapshot);
    await writeFile(join(outputDirectory, 'source.json'), `${JSON.stringify(existingMetadata, null, 2)}\n`);

    await syncOpenApi(sourcePath, 'b'.repeat(40), {
      outputDirectory,
      synchronizedAt: '2026-07-26T00:01:00.000Z',
    });
    const firstSnapshot = await readFile(join(outputDirectory, 'bugsport.json'), 'utf8');
    const firstMetadata = await readFile(join(outputDirectory, 'source.json'), 'utf8');

    await syncOpenApi(sourcePath, 'b'.repeat(40), {
      outputDirectory,
      synchronizedAt: '2026-07-26T00:02:00.000Z',
    });

    expect(firstSnapshot).toBe(canonicalSnapshot);
    expect(JSON.parse(firstSnapshot).paths['/v1/fixtures'].post.tags).toEqual(['fixtures', 'write']);
    expect(JSON.parse(firstMetadata).synchronizedAt).toBe(existingMetadata.synchronizedAt);
    await expect(readFile(join(outputDirectory, 'bugsport.json'), 'utf8')).resolves.toBe(firstSnapshot);
    await expect(readFile(join(outputDirectory, 'source.json'), 'utf8')).resolves.toBe(firstMetadata);
  });

  it('sorts object keys by Unicode code unit rather than locale collation', () => {
    expect(Object.keys(normalizeOpenApi({ z: 1, ä: 2, a: 3 }))).toEqual(['a', 'z', 'ä']);
  });

  it('generates the issue-ingestion page as a clearly marked artifact', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'bugsport-openapi-pages-'));
    temporaryDirectories.push(directory);

    await generateOpenApi(directory);
    const page = await readFile(join(directory, 'v1/projects/projectid/issues/post.mdx'), 'utf8');

    expect(page).toContain('This file was generated by Fumadocs. Do not edit this file directly.');
    expect(page).toContain('showDescription');
    expect(page).toContain('document="./openapi/bugsport.json"');
  });
});
