import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { platformPaths, siteConfig } from '@/lib/site';
import { docsSections, legacyRedirects } from '@/lib/navigation';

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
