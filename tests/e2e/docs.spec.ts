import { expect, test } from '@playwright/test';

const overflowIsAbsent = () => document.documentElement.scrollWidth <= document.documentElement.clientWidth;

async function waitForHydration(page: import('@playwright/test').Page, component: 'DocsShell' | 'NotFound' | 'Home') {
  await page.locator(`astro-island[component-export="${component}"]:not([ssr])`).waitFor();
}

test('serves the documentation directly from the site root', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Get started with BugsPort');
  await expect(page.locator('#nd-sidebar')).toHaveCount(0);
});

test('toggles search with the platform shortcut and finds the project API key guide', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page, 'Home');
  await page.keyboard.press('ControlOrMeta+k');
  const search = page.getByPlaceholder('Search');
  await expect(search).toBeVisible();
  await search.fill('project API key');
  await expect(page.getByRole('button', { name: /List API keys/ })).toBeVisible();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(search).toBeHidden();
});

test('switches the documentation theme', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page, 'Home');
  const themeSwitch = page.getByRole('button', { name: 'Toggle Theme' });
  await themeSwitch.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('links to BugsPort from the header', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page, 'Home');
  const goto = page.getByRole('link', { name: 'Goto BugsPort' });
  await expect(goto).toBeVisible();
  await expect(goto).toHaveAttribute('href', 'https://www.bugsport.io');
  await expect(goto).toHaveAttribute('target', '_blank');
});

test('keeps section links on the left of documentation pages', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'section links move into the sidebar on mobile');
  await page.goto('/sdks/android/getting-started');
  await waitForHydration(page, 'DocsShell');
  const header = page.locator('#nd-subnav');
  await expect(header.getByRole('link', { name: 'SDKs', exact: true })).toBeVisible();
  await expect(header.getByRole('link', { name: 'Goto BugsPort' })).toBeVisible();
});

test('shows feedback after copying Android configuration code', async ({ page }) => {
  await page.goto('/sdks/android/getting-started');
  await waitForHydration(page, 'DocsShell');
  const javaTab = page.getByRole('tab', { name: 'Java' });
  if (await javaTab.count()) {
    await javaTab.click();
  }
  const codeSample = page.locator('figure').filter({ hasText: 'BugsPortConfig.Builder' });
  await codeSample.getByRole('button', { name: 'Copy Text' }).click();
  await expect(codeSample.getByRole('button', { name: 'Copied Text' })).toBeVisible();
});

test('does not add a page-level Copy Markdown action', async ({ page }) => {
  await page.goto('/sdks/android/getting-started');
  await waitForHydration(page, 'DocsShell');
  await expect(page.getByRole('button', { name: 'Copy Markdown' })).toHaveCount(0);
});

test('provides a mobile navigation drawer at 390 by 844', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only behavior');
  await page.goto('/sdks/android/getting-started');
  await waitForHydration(page, 'DocsShell');
  await page.getByRole('button', { name: 'Open Sidebar' }).click();
  await expect(page.getByRole('link', { name: 'Getting Started', exact: true })).toBeVisible();
});

test('keeps the documentation layout usable at 1920 by 1080', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'wide', 'wide-only behavior');
  await page.goto('/sdks/android/getting-started');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#nd-page')).toBeVisible();
  await expect(page.locator('#nd-sidebar')).toBeVisible();
  await expect(page.locator('#nd-toc')).toBeVisible();
});

test('lists SDKs in the sidebar dropdown', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'dropdown lives in the sidebar drawer on mobile');
  await page.goto('/sdks/android/getting-started');
  await waitForHydration(page, 'DocsShell');
  await page.locator('#nd-sidebar').getByRole('button', { name: 'Android' }).click();
  await expect(page.getByRole('link', { name: 'iOS' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Flutter' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'React' })).toBeVisible();
});

test('pins sandbox and more links at the bottom of the sidebar', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'footer lives in the sidebar drawer on mobile');
  await page.goto('/sdks/android/getting-started');
  await waitForHydration(page, 'DocsShell');
  const sidebar = page.locator('#nd-sidebar');
  await expect(sidebar.getByText('Sandbox')).toBeVisible();
  await sidebar.getByRole('button', { name: 'More' }).click();
  await expect(sidebar.getByRole('link', { name: 'Discord' })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'X', exact: true })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'Meta' })).toBeVisible();
});

test('labels coming-soon pages', async ({ page }) => {
  await page.goto('/pricing');
  await waitForHydration(page, 'DocsShell');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pricing');
  await expect(page.locator('#nd-page').getByText('Coming soon').first()).toBeVisible();
});

test('recovers from an unknown route with useful navigation', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Page not found');
  await waitForHydration(page, 'NotFound');
  await page.getByRole('button', { name: 'Open Search' }).click();
  const search = page.getByPlaceholder('Search');
  await expect(search).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(search).toBeHidden();
  await expect(page.getByRole('link', { name: 'Browse documentation' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: 'Android setup' })).toHaveAttribute('href', '/sdks/android/getting-started');
});

test('serves legacy routes as static compatibility documents', async ({ page }) => {
  await page.goto('/docs/android-setup');
  await expect(page).toHaveURL(/\/sdks\/android\/getting-started\/?$/);
  await page.goto('/docs/platforms/android');
  await expect(page).toHaveURL(/\/sdks\/android\/getting-started\/?$/);
  await page.goto('/platforms/android');
  await expect(page).toHaveURL(/\/sdks\/android\/getting-started\/?$/);
});

test('reveals submit feedback after a helpful yes vote', async ({ page }) => {
  await page.goto('/sdks/android/getting-started');
  await waitForHydration(page, 'DocsShell');
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByRole('button', { name: 'Submit feedback' })).toBeVisible();
});

test('does not create horizontal overflow at the configured viewport', async ({ page }) => {
  await page.goto('/sdks/android/getting-started');
  await expect.poll(() => page.evaluate(overflowIsAbsent)).toBe(true);
});
