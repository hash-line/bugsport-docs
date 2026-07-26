import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { platformPaths, siteConfig } from '@/lib/site';
import { docsSections, legacyRedirects } from '@/lib/navigation';
import { markdownUrlForPage, renderLlmsFull, renderLlmsIndex, renderPageMarkdown } from '@/lib/markdown';
import { source } from '@/lib/source';

describe('site configuration', () => {
  it('uses production BugsPort destinations', () => {
    expect(siteConfig.url).toBe('https://docs.bugsport.io');
    expect(siteConfig.appUrl).toBe('https://app.bugsport.io');
  });

  it('prioritizes supported integration paths', () => {
    expect(platformPaths.map((item) => item.slug)).toEqual(['android', 'ios', 'rest-api', 'flutter']);
    expect(platformPaths.at(-1)?.status).toBe('coming-soon');
  });

  it('keeps the developer-first section order', () => {
    expect(docsSections.map((section) => section.title)).toEqual([
      'Start here',
      'Platforms',
      'Capture and diagnose',
      'Dashboard and workflow',
      'Reference',
    ]);
  });

  it('retains all useful legacy routes', () => {
    expect(legacyRedirects['/docs/android-setup']).toBe('/docs/platforms/android');
    expect(legacyRedirects['/docs/ios-setup']).toBe('/docs/platforms/ios');
  });
});

describe('homepage integration path', () => {
  it('guides developers to an integration without advertising an npm package', () => {
    const home = readFileSync(resolve(process.cwd(), 'src/components/Home.tsx'), 'utf8');

    expect(home).toContain('Choose your integration');
    expect(home).toContain('Send your first issue');
    expect(home).not.toMatch(/npm (install|i) (?:@?bugsport)/i);
  });
});

describe('platform guides', () => {
  const docsFiles = [
    'content/docs/get-started/index.mdx',
    'content/docs/get-started/choose-platform.mdx',
    'content/docs/get-started/first-issue.mdx',
    'content/docs/get-started/verify.mdx',
    'content/docs/platforms/index.mdx',
    'content/docs/platforms/android.mdx',
    'content/docs/platforms/ios.mdx',
    'content/docs/platforms/rest-api.mdx',
    'content/docs/platforms/flutter.mdx',
  ];

  it('publishes source-backed setup paths without obsolete integrations', () => {
    for (const file of docsFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf8');

      expect(content).not.toContain("implementation 'io.bugsport:bugsport-android:1.0.0'");
      expect(content).not.toContain("pod 'Bugsport'");
      expect(content).not.toContain('Bugsport.start');
      expect(content).not.toMatch(/npm (install|i) (?:@?bugsport)/i);
      expect(content).not.toContain('https://api.bugsport.com');
    }
  });

  it('keeps mobile authentication and the Flutter status explicit', () => {
    for (const file of [
      'content/docs/platforms/android.mdx',
      'content/docs/platforms/ios.mdx',
      'content/docs/platforms/rest-api.mdx',
    ]) {
      expect(readFileSync(resolve(process.cwd(), file), 'utf8')).toContain('x-api-key');
    }

    const flutter = readFileSync(resolve(process.cwd(), 'content/docs/platforms/flutter.mdx'), 'utf8');
    expect(flutter).toContain('Coming soon');
    expect(flutter).not.toMatch(/(?:npm|pnpm|yarn|bun|flutter|dart|pod|gradle)\s+(?:add|install|i)\b/i);
  });

  it('uses a server-supported field path in the REST validation request', () => {
    const rest = readFileSync(resolve(process.cwd(), 'content/docs/platforms/rest-api.mdx'), 'utf8');

    expect(rest).toContain('"path": "/fields/title"');
    expect(rest).not.toContain('"path": "/title"');
  });
});

describe('product workflow and AI-readable documentation', () => {
  it('publishes the diagnostic, workflow, and troubleshooting routes in the documentation collection', () => {
    const requiredRoutes = [
      'capture/crashes.mdx',
      'dashboard/organizations-teams-projects.mdx',
      'reference/troubleshooting.mdx',
    ]
      .filter((file) => existsSync(resolve(process.cwd(), 'content/docs', file)))
      .map((file) => `/docs/${file.replace(/\.mdx$/, '')}`);

    expect(requiredRoutes).toEqual(expect.arrayContaining([
      '/docs/capture/crashes',
      '/docs/dashboard/organizations-teams-projects',
      '/docs/reference/troubleshooting',
    ]));
  });

  it('renders deterministic Markdown with canonical source URLs from the documentation collection', () => {
    const android = {
      url: '/docs/platforms/android',
      data: {
        title: 'Android',
        description: 'Connect the pre-alpha Android SDK to a BugsPort project.',
        _raw: { body: readFileSync(resolve(process.cwd(), 'content/docs/platforms/android.mdx'), 'utf8') },
      },
    };
    const index = {
      url: '/docs',
      data: {
        title: 'BugsPort documentation',
        description: 'Integrate BugsPort, send your first issue, and diagnose mobile failures.',
        _raw: { body: readFileSync(resolve(process.cwd(), 'content/docs/index.mdx'), 'utf8') },
      },
    };

    expect(renderPageMarkdown(android)).toContain(
      '# Android\n\nSource: https://docs.bugsport.io/docs/platforms/android',
    );
    expect(markdownUrlForPage(android)).toBe('/docs/platforms/android.md');
    expect(markdownUrlForPage(index)).toBe('/docs/index.md');
    expect(renderLlmsIndex([index, android])).toContain('[Android](/docs/platforms/android)');
    expect(renderLlmsFull([index, android])).toContain('# BugsPort documentation');
    expect(renderLlmsFull([index, android])).toBe(renderLlmsFull([index, android]));
  });

  it('exports a real generated OpenAPI page with its reviewed operation details', () => {
    const createIssue = source.getPages().find((page) => (
      page.url === '/docs/reference/api/v1/projects/projectid/issues/post'
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
      url: '/docs/reference/api/example',
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
