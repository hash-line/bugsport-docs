export type PlatformStatus = 'available' | 'pre-alpha' | 'coming-soon';

export interface PlatformPath {
  slug: 'android' | 'ios' | 'rest-api' | 'flutter';
  title: string;
  description: string;
  href: string;
  status: PlatformStatus;
}

export const siteConfig = {
  name: 'BugsPort Docs',
  url: 'https://docs.bugsport.io',
  appUrl: 'https://app.bugsport.io',
  githubUrl: 'https://github.com/hash-line/bugsport-docs',
} as const;

export const platformPaths = [
  {
    slug: 'android',
    title: 'Android',
    description: 'Set up the Android client and verify your first issue.',
    href: '/docs/platforms/android',
    status: 'pre-alpha',
  },
  {
    slug: 'ios',
    title: 'iOS',
    description: 'Set up the iOS client and verify your first issue.',
    href: '/docs/platforms/ios',
    status: 'pre-alpha',
  },
  {
    slug: 'rest-api',
    title: 'REST API',
    description: 'Send issue data with BugsPort’s project API key.',
    href: '/docs/platforms/rest-api',
    status: 'available',
  },
  {
    slug: 'flutter',
    title: 'Flutter',
    description: 'Flutter support is being prepared for release.',
    href: '/docs/platforms/flutter',
    status: 'coming-soon',
  },
] as const satisfies readonly PlatformPath[];
