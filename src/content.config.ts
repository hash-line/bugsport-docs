import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const status = z.enum(['available', 'pre-alpha', 'coming-soon']);

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/docs' }),
  schema: z.looseObject({
    title: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    status: status.optional(),
  }),
});

const meta = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml}', base: './content/docs' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    status: status.optional(),
    pages: z.array(z.string()).optional(),
  }),
});

export const collections = { docs, meta };
