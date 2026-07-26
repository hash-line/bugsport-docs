import type { APIRoute } from 'astro';
import { orderPagesBySidebar, renderLlmsFull, type MarkdownPage } from '@/lib/markdown';
import { source } from '@/lib/source';

export const prerender = true;

export const GET: APIRoute = () => new Response(
  renderLlmsFull(orderPagesBySidebar(source.getPages() as MarkdownPage[], source.getPageTree())),
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
