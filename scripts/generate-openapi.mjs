import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = './openapi/bugsport.json';
const generatedDirectory = resolve(projectRoot, 'content/docs/reference/api');

/** Generate only the disposable REST reference artifacts. */
export async function generateOpenApi(outputDirectory = generatedDirectory) {
  await rm(outputDirectory, { recursive: true, force: true });

  await generateFiles({
    input: createOpenAPI({ input: [snapshotPath] }),
    output: outputDirectory,
    includeDescription: true,
    meta: true,
  });

  return outputDirectory;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  generateOpenApi().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
