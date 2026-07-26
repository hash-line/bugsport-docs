import { type CollectionEntry, getCollection } from 'astro:content';
import { structure, type StructuredData } from 'fumadocs-core/mdx-plugins';
import { loader, type StaticSource } from 'fumadocs-core/source';
import * as path from 'node:path';

export const source = loader({
  source: await createSource(),
  baseUrl: '/docs',
});

export function getStructuredData(entry: CollectionEntry<'docs'>): StructuredData {
  if (entry.body === undefined) {
    throw new Error(`Documentation entry ${entry.id} has no Markdown body.`);
  }

  return structure(entry.body);
}

async function createSource() {
  const out: StaticSource<{
    metaData: CollectionEntry<'meta'>['data'];
    pageData: CollectionEntry<'docs'>['data'] & {
      _raw: CollectionEntry<'docs'>;
      structuredData: StructuredData;
    };
  }> = { files: [] };

  for (const page of await getCollection('docs')) {
    out.files.push({
      type: 'page',
      path: path.relative('content/docs', page.filePath!),
      data: {
        ...page.data,
        _raw: page,
        structuredData: getStructuredData(page),
      },
    });
  }

  for (const meta of await getCollection('meta')) {
    out.files.push({
      type: 'meta',
      path: path.relative('content/docs', meta.filePath!),
      data: meta.data,
    });
  }

  return out;
}
