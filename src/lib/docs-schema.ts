import { z } from 'astro/zod';

const status = z.enum(['available', 'pre-alpha', 'coming-soon']);

export const docsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  status: status.optional(),
  full: z.boolean().optional(),
  _openapi: z.record(z.string(), z.json()).optional(),
}).strict();

export const metaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  root: z.boolean().optional(),
  defaultOpen: z.boolean().optional(),
  status: status.optional(),
  pages: z.array(z.string()).optional(),
});
