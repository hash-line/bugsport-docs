import { expect, test } from '@playwright/test';

const overflowIsAbsent = () => document.documentElement.scrollWidth <= document.documentElement.clientWidth;

async function waitForHydration(page: import('@playwright/test').Page, component: 'Home' | 'DocsShell' | 'NotFound') {
  await page.locator(`astro-island[component-export="${component}"]:not([ssr])`).waitFor();
}

test('routes developers from homepage to Android setup', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page, 'Home');
  await page.getByRole('link', { name: 'Android' }).click();
  await expect(page).toHaveURL(/\/docs\/platforms\/android\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Android');
});

test('opens search with the platform shortcut and finds the project API key guide', async ({ page }) => {
  await page.goto('/docs');
  await waitForHydration(page, 'DocsShell');
  await page.keyboard.press('ControlOrMeta+k');
  const search = page.getByPlaceholder('Search');
  await expect(search).toBeVisible();
  await search.fill('project API key');
  await expect(page.getByRole('button', { name: /List API keys/ })).toBeVisible();
});

test('switches the documentation theme', async ({ page }) => {
  await page.goto('/docs');
  await waitForHydration(page, 'DocsShell');
  const themeSwitch = page.getByRole('button', { name: 'Toggle Theme' });
  await themeSwitch.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('shows feedback after copying Android configuration code', async ({ page }) => {
  await page.goto('/docs/platforms/android');
  await waitForHydration(page, 'DocsShell');
  const codeSample = page.locator('figure').filter({ hasText: 'BugsPortConfig.Builder' });
  await codeSample.getByRole('button', { name: 'Copy Text' }).click();
  await expect(codeSample.getByRole('button', { name: 'Copied Text' })).toBeVisible();
});

test('provides a mobile navigation drawer at 390 by 844', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only behavior');
  await page.goto('/docs/platforms/android');
  await waitForHydration(page, 'DocsShell');
  await page.getByRole('button', { name: 'Open Sidebar' }).click();
  await expect(page.getByRole('link', { name: 'Android', exact: true })).toBeVisible();
});

test('keeps the documentation layout usable at 1920 by 1080', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'wide', 'wide-only behavior');
  await page.goto('/docs/platforms/android');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#nd-page')).toBeVisible();
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
  await expect(page.getByRole('link', { name: 'Browse documentation' })).toHaveAttribute('href', '/docs');
  await expect(page.getByRole('link', { name: 'Android setup' })).toHaveAttribute('href', '/docs/platforms/android');
});

test('serves legacy routes as static compatibility documents', async ({ page }) => {
  await page.goto('/docs/android-setup');
  await expect(page).toHaveURL(/\/docs\/platforms\/android\/?$/);
});

test('does not create horizontal overflow at the configured viewport', async ({ page }) => {
  await page.goto('/docs/platforms/android');
  await expect.poll(() => page.evaluate(overflowIsAbsent)).toBe(true);
});
