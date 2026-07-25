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
