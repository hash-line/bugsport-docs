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
  return page.url === '/' ? '/index.md' : `${page.url}.md`;
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
    return renderOpenApiBody(page.data._raw.body ?? '');
  }

  return (page.data._raw.body ?? '')
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}\s*/g, '')
    .trim();
}

function renderOpenApiBody(body: string): string {
  const operations = parseOpenApiOperations(body);

  if (operations === undefined) {
    return [
      '## OpenAPI operation details unavailable',
      '',
      'This generated page could not parse its operation metadata from the reviewed BugsPort REST OpenAPI snapshot.',
    ].join('\n');
  }

  return [
    '## Operations',
    '',
    ...operations.flatMap(({ method, path }) => [
      `### ${method} ${path}`,
      '',
      `Method: \`${method}\``,
      `Path: \`${path}\``,
      '',
    ]),
    'These operation details are generated from the reviewed BugsPort REST OpenAPI snapshot.',
  ].join('\n');
}

function parseOpenApiOperations(body: string): Array<{ method: string; path: string }> | undefined {
  const match = /operations\s*=\s*\{(\[[\s\S]*?\])\}/.exec(body);
  if (match === null) return undefined;

  let value: unknown;
  try {
    value = JSON.parse(match[1]);
  } catch {
    return undefined;
  }

  if (!Array.isArray(value) || value.length === 0) return undefined;

  const operations: Array<{ method: string; path: string }> = [];
  for (const operation of value) {
    if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
      return undefined;
    }

    const { method, path } = operation as Record<string, unknown>;
    if (
      typeof method !== 'string'
      || !/^[A-Za-z]+$/.test(method)
      || typeof path !== 'string'
      || !/^\/[^\s`]*$/.test(path)
    ) {
      return undefined;
    }

    operations.push({ method: method.toUpperCase(), path });
  }

  return operations;
}
