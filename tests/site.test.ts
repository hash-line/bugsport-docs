import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/lib/site';
import { contentRedirects, legacyRedirects } from '@/lib/navigation';
import { markdownUrlForPage, renderLlmsFull, renderLlmsIndex, renderPageMarkdown } from '@/lib/markdown';
import { source } from '@/lib/source';

describe('site configuration', () => {
  it('uses production BugsPort destinations', () => {
    expect(siteConfig.url).toBe('https://docs.bugsport.io');
  });

  it('retains all useful legacy routes', () => {
    expect(legacyRedirects['/docs/android-setup']).toBe('/sdks/android/getting-started');
    expect(legacyRedirects['/docs/ios-setup']).toBe('/sdks/ios/getting-started');
    expect(contentRedirects['/platforms/android']).toBe('/sdks/android/getting-started');
  });
});

describe('Fumadocs defaults', () => {
  it('serves documentation from the domain root without redundant UI overrides', () => {
    const baseLayout = readFileSync(resolve(process.cwd(), 'src/components/BaseLayout.astro'), 'utf8');
    const docsShell = readFileSync(resolve(process.cwd(), 'src/components/DocsShell.tsx'), 'utf8');

    expect(existsSync(resolve(process.cwd(), 'src/components/Home.tsx'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'src/components/SearchDialog.tsx'))).toBe(false);
    expect(source.getPage([])).toBeUndefined();
    expect(source.getPages().every((page) => !page.url.startsWith('/docs'))).toBe(true);
    expect(baseLayout).not.toContain('ClientRouter');
    expect(docsShell).not.toContain('MarkdownCopyButton');
    expect(docsShell).toContain("search={{ options: { type: 'static' } }}");
    expect(docsShell).toContain('DocsTitle');
    expect(docsShell).toContain('DocsDescription');
    expect(docsShell).toContain('DocsBody');
    expect(docsShell).toContain('PageFeedback');
  });
});

describe('section information architecture', () => {
  it('publishes SDK, API, product, manage, and pricing routes', () => {
    expect(source.getPage(['sdks', 'android', 'getting-started'])).toBeDefined();
    expect(source.getPage(['sdks', 'ios', 'getting-started'])).toBeDefined();
    expect(source.getPage(['api'])).toBeDefined();
    expect(source.getPage(['product'])).toBeDefined();
    expect(source.getPage(['manage', 'organizations-teams-projects'])).toBeDefined();
    expect(source.getPage(['pricing'])?.data.status).toBe('coming-soon');
    expect(source.getPage(['sdks', 'flutter', 'getting-started'])?.data.status).toBe('coming-soon');
    expect(source.getPage(['sdks', 'react', 'getting-started'])?.data.status).toBe('coming-soon');
  });
});

describe('platform guides', () => {
  const docsFiles = [
    'content/docs/sdks/index.mdx',
    'content/docs/sdks/android/getting-started.mdx',
    'content/docs/sdks/ios/getting-started.mdx',
    'content/docs/sdks/flutter/getting-started.mdx',
    'content/docs/sdks/react/getting-started.mdx',
    'content/docs/api/index.mdx',
  ];

  it('publishes source-backed setup paths without obsolete integrations', () => {
    for (const file of docsFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf8');

      expect(content).not.toContain("implementation 'io.bugsport:bugsport-android:1.0.0'");
      expect(content).not.toContain("pod 'Bugsport'");
      expect(content).not.toContain('Bugsport.start');
      expect(content).not.toContain('com.hashline.bugsport');
      expect(content).not.toContain('shared.initialize');
      expect(content).not.toMatch(/npm (install|i) (?:@?bugsport)/i);
      expect(content).not.toContain('https://api.bugsport.com');
    }
  });

  it('keeps mobile authentication and the Flutter status explicit', () => {
    for (const file of [
      'content/docs/sdks/android/getting-started.mdx',
      'content/docs/sdks/ios/getting-started.mdx',
      'content/docs/api/index.mdx',
    ]) {
      expect(readFileSync(resolve(process.cwd(), file), 'utf8')).toContain('x-api-key');
    }

    const flutter = readFileSync(resolve(process.cwd(), 'content/docs/sdks/flutter/getting-started.mdx'), 'utf8');
    expect(flutter).toContain('Coming soon');
    expect(flutter).not.toMatch(/(?:npm|pnpm|yarn|bun|flutter|dart|pod|gradle)\s+(?:add|install|i)\b/i);
  });

  it('uses a server-supported field path in the REST validation request', () => {
    const rest = readFileSync(resolve(process.cwd(), 'content/docs/api/index.mdx'), 'utf8');

    expect(rest).toContain('"path": "/fields/title"');
    expect(rest).not.toContain('"path": "/title"');
  });

  it('documents the nested BugsPortConfig initialization contract', () => {
    const android = readFileSync(resolve(process.cwd(), 'content/docs/sdks/android/getting-started.mdx'), 'utf8');
    const ios = readFileSync(resolve(process.cwd(), 'content/docs/sdks/ios/getting-started.mdx'), 'utf8');
    const liveInitDocs = [android, ios];

    expect(android).toContain('import io.bugsport.BugsPort');
    expect(android).toContain('import io.bugsport.initialize');
    expect(android).toContain('BugsPort.initialize(this)');
    expect(android).toContain('BugsPortConfig.Builder');
    expect(android).toContain('apiHalt');
    expect(android).toContain('ApiHaltOptions');
    expect(android).toContain('tab="Kotlin"');
    expect(android).toContain('tab="Java"');
    expect(android).not.toContain('com.hashline.bugsport');
    expect(android).not.toContain('shared.initialize');

    expect(ios).toContain('BugsPortConfig.Builder');
    expect(ios).toContain('BugsPort.companion.initialize(config:');
    expect(ios).toContain('apiHalt');

    for (const content of liveInitDocs) {
      expect(content).toContain('apiHalt.defaultFilter');
      expect(content).toContain('first-run seed');
      expect(content).not.toContain('requestFilter');
      expect(content).not.toContain('IssueReportingOptions');
      expect(content).not.toContain('AutoAttachment');
      expect(content).not.toContain('NetworkTraceOptions');
      expect(content).not.toContain('environment');
    }
  });
});

describe('product workflow and AI-readable documentation', () => {
  it('publishes the diagnostic, workflow, and troubleshooting routes in the documentation collection', () => {
    const requiredRoutes = [
      'product/crashes.mdx',
      'manage/organizations-teams-projects.mdx',
      'product/troubleshooting.mdx',
    ]
      .filter((file) => existsSync(resolve(process.cwd(), 'content/docs', file)))
      .map((file) => `/${file.replace(/\.mdx$/, '')}`);

    expect(requiredRoutes).toEqual(expect.arrayContaining([
      '/product/crashes',
      '/manage/organizations-teams-projects',
      '/product/troubleshooting',
    ]));
  });

  it('renders deterministic Markdown with canonical source URLs from the documentation collection', () => {
    const android = {
      url: '/sdks/android/getting-started',
      data: {
        title: 'Getting Started',
        description: 'Connect the pre-alpha Android SDK to a BugsPort project.',
        _raw: { body: readFileSync(resolve(process.cwd(), 'content/docs/sdks/android/getting-started.mdx'), 'utf8') },
      },
    };
    const index = {
      url: '/sdks',
      data: {
        title: 'SDKs',
        description: 'Choose a BugsPort SDK and initialize it with a project ID and API key.',
        _raw: { body: readFileSync(resolve(process.cwd(), 'content/docs/sdks/index.mdx'), 'utf8') },
      },
    };

    expect(renderPageMarkdown(android)).toContain(
      '# Getting Started\n\nSource: https://docs.bugsport.io/sdks/android/getting-started',
    );
    expect(markdownUrlForPage(android)).toBe('/sdks/android/getting-started.md');
    expect(markdownUrlForPage(index)).toBe('/sdks.md');
    expect(renderLlmsIndex([index, android])).toContain('[Getting Started](/sdks/android/getting-started)');
    expect(renderLlmsFull([index, android])).toContain('# SDKs');
    expect(renderLlmsFull([index, android])).toBe(renderLlmsFull([index, android]));
  });

  it('exports a real generated OpenAPI page with its reviewed operation details', () => {
    const createIssue = source.getPages().find((page) => (
      page.url === '/api/reference/v1/projects/projectid/issues/post'
    ));

    expect(createIssue?.data._openapi).toBeDefined();
    expect(createIssue).toBeDefined();

    const markdown = renderPageMarkdown(createIssue!);

    expect(markdown).toContain('Method: `POST`');
    expect(markdown).toContain('Path: `/v1/projects/{projectId}/issues`');
    expect(markdown).toContain('reviewed BugsPort REST OpenAPI snapshot');
    expect(markdown).not.toContain('<Comp');
    expect(markdown).not.toContain('operations={');
    expect(renderLlmsFull([createIssue!])).toContain('Path: `/v1/projects/{projectId}/issues`');
  });

  it('uses an explicit fallback when generated OpenAPI operation metadata is malformed', () => {
    const markdown = renderPageMarkdown({
      url: '/api/reference/example',
      data: {
        title: 'Malformed API page',
        _openapi: {},
        _raw: { body: '<Comp operations={not-json} />' },
      },
    });

    expect(markdown).toContain('OpenAPI operation details unavailable');
    expect(markdown).toContain('could not parse its operation metadata');
    expect(markdown).not.toContain('Method:');
    expect(markdown).not.toContain('Path:');
  });
});
