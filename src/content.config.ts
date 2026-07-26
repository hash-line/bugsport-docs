import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema, metaSchema } from './lib/docs-schema';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/docs' }),
  schema: docsSchema,
});

const meta = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml}', base: './content/docs' }),
  schema: metaSchema,
});

export const collections = { docs, meta };
