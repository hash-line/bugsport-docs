import type { Root } from 'fumadocs-core/page-tree';
import { siteConfig } from './site';

export interface MarkdownPage {
  url: string;
  data: {
    title: string;
    description?: string;
    _openapi?: Record<string, unknown>;
    _raw: { body?: string };
  };
}

export function markdownUrlForPage(page: Pick<MarkdownPage, 'url'>): string {
  return page.url === '/docs' ? '/docs/index.md' : `${page.url}.md`;
}

export function renderPageMarkdown(page: MarkdownPage): string {
  return `# ${page.data.title}\n\nSource: ${siteConfig.url}${page.url}\n\n${renderBody(page)}\n`;
}

export function renderLlmsIndex(pages: readonly MarkdownPage[]): string {
  return [
    '# BugsPort documentation',
    '',
    'Static documentation index generated from the public docs collection.',
    '',
    ...pages.map((page) => `- [${page.data.title}](${page.url})${page.data.description ? `: ${page.data.description}` : ''}`),
    '',
  ].join('\n');
}

export function renderLlmsFull(pages: readonly MarkdownPage[]): string {
  return pages.map(renderPageMarkdown).join('\n');
}

export function orderPagesBySidebar(pages: readonly MarkdownPage[], tree: Root): MarkdownPage[] {
  const pagesByUrl = new Map(pages.map((page) => [page.url, page]));
  const ordered: MarkdownPage[] = [];
  const seen = new Set<string>();

  const add = (url: string) => {
    const page = pagesByUrl.get(url);
    if (page !== undefined && !seen.has(url)) {
      seen.add(url);
      ordered.push(page);
    }
  };

  const visit = (nodes: Root['children']) => {
    for (const node of nodes) {
      if (node.type === 'page') {
        add(node.url);
      } else if (node.type === 'folder') {
        if (node.index !== undefined) add(node.index.url);
        visit(node.children);
      }
    }
  };

  visit(tree.children);
  for (const page of pages) add(page.url);
  return ordered;
}

function renderBody(page: MarkdownPage): string {
  if (page.data._openapi !== undefined) {
    return 'This page is generated from the reviewed BugsPort REST OpenAPI snapshot.';
  }

  return (page.data._raw.body ?? '')
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}\s*/g, '')
    .trim();
}
