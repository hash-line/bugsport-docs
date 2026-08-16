export const legacyRedirects = {
  '/docs/intro': '/',
  '/docs/getting-started': '/sdks',
  '/docs/installation': '/sdks',
  '/docs/quickstart': '/api',
  '/docs/android-setup': '/sdks/android/getting-started',
  '/docs/ios-setup': '/sdks/ios/getting-started',
  '/docs/github-pages': '/',
  '/docs/contributing': 'https://github.com/hash-line/bugsport-docs',
} as const;

export const contentRedirects = {
  '/get-started': '/sdks',
  '/get-started/choose-platform': '/sdks',
  '/get-started/first-issue': '/api',
  '/get-started/verify': '/api',
  '/platforms': '/sdks',
  '/platforms/android': '/sdks/android/getting-started',
  '/platforms/ios': '/sdks/ios/getting-started',
  '/platforms/flutter': '/sdks/flutter/getting-started',
  '/platforms/rest-api': '/api',
  '/capture/crashes': '/product/crashes',
  '/capture/anrs': '/product/anrs',
  '/capture/network-traces': '/product/network-traces',
  '/capture/context-and-attachments': '/product/context-and-attachments',
  '/dashboard/organizations-teams-projects': '/manage/organizations-teams-projects',
  '/dashboard/issue-triage': '/product/issue-triage',
  '/dashboard/collaboration': '/manage/collaboration',
  '/dashboard/alerts': '/product/alerts',
  '/dashboard/integrations': '/product/integrations',
  '/reference/rest-api': '/api',
  '/reference/android-configuration': '/sdks/android/getting-started',
  '/reference/ios-configuration': '/sdks/ios/getting-started',
  '/reference/data-and-privacy': '/product/data-and-privacy',
  '/reference/troubleshooting': '/product/troubleshooting',
  '/reference/release-status': '/product/release-status',
} as const;

export function redirectTarget(pathname: string): string | undefined {
  if (pathname in legacyRedirects) {
    return legacyRedirects[pathname as keyof typeof legacyRedirects];
  }
  if (pathname in contentRedirects) {
    return contentRedirects[pathname as keyof typeof contentRedirects];
  }
  if (pathname.startsWith('/reference/api/')) {
    return `/api/reference/${pathname.slice('/reference/api/'.length)}`;
  }
  if (pathname.startsWith('/docs/')) {
    const withoutPrefix = pathname.slice('/docs'.length) || '/';
    return redirectTarget(withoutPrefix) ?? (withoutPrefix === '/' ? '/' : withoutPrefix);
  }
}
