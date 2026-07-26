import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const executeFile = promisify(execFile);
const contractPath = 'packages/contracts/openapi.json';
const generatorPath = 'packages/contracts/src/openapi/generate.ts';
const generatorCommand = 'pnpm -C packages/contracts openapi';
const repository = 'hash-line/bugsport';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Normalize JSON objects for stable review diffs. JSON/OpenAPI object member
 * order is insignificant; array order can be semantic and is preserved.
 */
export function normalizeOpenApi(value) {
  if (Array.isArray(value)) return value.map(normalizeOpenApi);

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, child]) => [key, normalizeOpenApi(child)]),
    );
  }

  return value;
}

export function assertCleanCheckoutStatus(status) {
  if (status.trim() !== '') {
    throw new Error(
      `BugsPort checkout must be clean before generating OpenAPI provenance.\n${status.trim()}`,
    );
  }
}

function parseOpenApi(source, sourcePath) {
  let document;

  try {
    document = JSON.parse(source);
  } catch (error) {
    throw new Error(`OpenAPI source at ${sourcePath} is not valid JSON.`, { cause: error });
  }

  if (document === null || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error(`OpenAPI source at ${sourcePath} must contain an object.`);
  }

  if (typeof document.openapi !== 'string' || !/^3\.1(?:\.\d+)?$/.test(document.openapi)) {
    throw new Error(`OpenAPI source at ${sourcePath} must declare an OpenAPI 3.1.x version.`);
  }

  if (document.info === null || typeof document.info !== 'object' || Array.isArray(document.info)) {
    throw new Error(`OpenAPI source at ${sourcePath} must include an info object.`);
  }

  if (document.paths === null || typeof document.paths !== 'object' || Array.isArray(document.paths)) {
    throw new Error(`OpenAPI source at ${sourcePath} must include a paths object.`);
  }

  return document;
}

async function readJsonIfPresent(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function readTextIfPresent(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return undefined;
    throw error;
  }
}

/**
 * Synchronize an exact source document into the local reviewable snapshot.
 * The optional outputDirectory supports isolated helper-level verification.
 */
export async function syncOpenApi(sourcePath, sourceCommit, options = {}) {
  if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
    throw new Error('OpenAPI source commit must be a full 40-character Git SHA.');
  }

  const outputDirectory = options.outputDirectory ?? resolve(projectRoot, 'openapi');
  const rawSource = await readFile(sourcePath);
  const sourceSha256 = createHash('sha256').update(rawSource).digest('hex');
  const normalizedDocument = normalizeOpenApi(parseOpenApi(rawSource.toString('utf8'), sourcePath));
  const snapshot = `${JSON.stringify(normalizedDocument, null, 2)}\n`;
  const snapshotPath = resolve(outputDirectory, 'bugsport.json');
  const metadataPath = resolve(outputDirectory, 'source.json');
  const existingMetadata = await readJsonIfPresent(metadataPath);
  const existingSnapshotText = await readTextIfPresent(snapshotPath);
  const existingSnapshot = existingSnapshotText === undefined ? undefined : JSON.parse(existingSnapshotText);
  const normalizedExistingSnapshot = existingSnapshot === undefined
    ? undefined
    : `${JSON.stringify(normalizeOpenApi(existingSnapshot), null, 2)}\n`;
  const sourceIdentityUnchanged = existingMetadata
    && existingMetadata.repository === repository
    && existingMetadata.path === contractPath
    && existingMetadata.commit === sourceCommit
    && existingMetadata.sha256 === sourceSha256;
  const identityUnchanged = sourceIdentityUnchanged
    && existingMetadata.generator?.path === generatorPath
    && existingMetadata.generator?.command === generatorCommand;
  const contentUnchanged = normalizedExistingSnapshot === snapshot;

  if (identityUnchanged && contentUnchanged && existingSnapshotText === snapshot) return;

  const synchronizedAt = sourceIdentityUnchanged && contentUnchanged
    ? existingMetadata.synchronizedAt
    : options.synchronizedAt ?? new Date().toISOString();
  const metadata = {
    repository,
    path: contractPath,
    commit: sourceCommit,
    sha256: sourceSha256,
    generator: {
      path: generatorPath,
      command: generatorCommand,
    },
    synchronizedAt,
  };

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(snapshotPath, snapshot),
    writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`),
  ]);
}

export function getCheckoutArgument(argv) {
  return argv[2] === '--' ? argv[3] : argv[2];
}

async function main() {
  const checkout = getCheckoutArgument(process.argv);

  if (checkout === undefined) {
    throw new Error('Usage: pnpm sync:openapi -- <bugsport-checkout>');
  }

  const checkoutRoot = resolve(checkout);
  const { stdout: status } = await executeFile(
    'git',
    ['-C', checkoutRoot, 'status', '--porcelain=v1', '--untracked-files=all'],
  );
  assertCleanCheckoutStatus(status);

  const { stdout: commit } = await executeFile('git', ['-C', checkoutRoot, 'rev-parse', 'HEAD']);
  const sourceCommit = commit.trim();
  await executeFile('git', ['-C', checkoutRoot, 'cat-file', '-e', `${sourceCommit}:${generatorPath}`]);
  await executeFile('pnpm', ['-C', 'packages/contracts', 'openapi'], { cwd: checkoutRoot });

  await syncOpenApi(resolve(checkoutRoot, contractPath), sourceCommit);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
