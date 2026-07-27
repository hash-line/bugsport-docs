import type { APIRoute } from 'astro';
import { renderPageMarkdown, type MarkdownPage } from '@/lib/markdown';
import { source } from '@/lib/source';

export const prerender = true;

export function getStaticPaths() {
  return source.getPages().map((page) => ({
    params: { slug: page.slugs.length === 0 ? 'index' : page.slugs.join('/') },
    props: { page },
  }));
}

export const GET: APIRoute = ({ props }) => new Response(renderPageMarkdown(props.page as MarkdownPage), {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
});
