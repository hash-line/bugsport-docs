export interface DocsSection {
  title: string;
  href: string;
}

export const docsSections = [
  { title: 'Start here', href: '/docs/get-started' },
  { title: 'Platforms', href: '/docs/platforms' },
  { title: 'Capture and diagnose', href: '/docs/capture' },
  { title: 'Dashboard and workflow', href: '/docs/dashboard' },
  { title: 'Reference', href: '/docs/reference' },
] as const satisfies readonly DocsSection[];

export const legacyRedirects = {
  '/docs/intro': '/docs',
  '/docs/getting-started': '/docs/get-started',
  '/docs/installation': '/docs/get-started',
  '/docs/quickstart': '/docs/get-started/first-issue',
  '/docs/android-setup': '/docs/platforms/android',
  '/docs/ios-setup': '/docs/platforms/ios',
  '/docs/github-pages': '/docs',
  '/docs/contributing': 'https://github.com/hash-line/bugsport-docs',
} as const;
