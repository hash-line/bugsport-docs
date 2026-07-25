# BugsPort Fumadocs Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the starter Docusaurus site with a production-ready Astro/Fumadocs documentation site at `docs.bugsport.io`.

**Architecture:** Astro statically renders Fumadocs UI through React islands. Astro content collections provide the page tree, Orama provides a build-time search index, generated routes expose Markdown and LLM indexes, and GitHub Pages serves the immutable `dist` artifact produced by GitHub Actions. Public integration content is rewritten from the current BugsPort client repositories and the REST OpenAPI contract rather than copied from the old docs.

**Tech Stack:** Node.js 24, pnpm 10, Astro 7, React 19, Fumadocs 16, Tailwind CSS 4, Orama 3, Fumadocs OpenAPI 11, Vitest 4, Playwright 1.61, GitHub Pages

## Global Constraints

- Use Astro with Fumadocs UI and React islands; do not introduce Next.js or a server runtime.
- Build and deploy a static site.
- Use pnpm and Node.js 22.12 or newer; the repository standard is Node.js 24 and pnpm 10.
- Mobile clients authenticate with a project-scoped `x-api-key`; do not document logged-in session authentication for mobile ingestion.
- Do not advertise an npm/JavaScript BugsPort package.
- Android, iOS, and REST examples must be verified against source code, released artifacts, or the OpenAPI contract.
- Mark Flutter as coming soon and publish no installation commands until its package is released.
- Preserve useful legacy URLs with generated static compatibility pages and canonical replacement URLs.
- Include static search, `llms.txt`, `llms-full.txt`, Markdown page output, and copy-page actions in v1.
- Hosted AI chat, localization, authenticated documentation, and credential-bearing interactive API requests are out of scope.

---

## File Structure

### Application foundation

- `package.json` — scripts, engines, pinned production and development dependencies
- `pnpm-lock.yaml` — reproducible dependency graph
- `astro.config.mjs` — Astro, React, MDX, Tailwind, Fumadocs Markdown plugins, static output, and canonical site URL
- `tsconfig.json` — strict Astro TypeScript configuration and `@/*` alias
- `vitest.config.ts` — unit/content test configuration
- `playwright.config.ts` — browser test server and viewport projects
- `public/CNAME` — GitHub Pages custom domain declaration for `docs.bugsport.io`

### Site and rendering

- `src/lib/site.ts` — brand, canonical URLs, repository links, and platform path data
- `src/lib/navigation.ts` — explicit documentation hierarchy and legacy redirect map
- `src/content.config.ts` — validated docs and metadata content collections
- `src/lib/source.ts` — Astro collection to Fumadocs source adapter
- `src/components/BaseLayout.astro` — document metadata, fonts, theme bootstrapping, and shared body
- `src/components/Brand.tsx` — BugsPort logo and Docs identity
- `src/components/DocsShell.tsx` — Fumadocs provider, navigation, TOC, and page actions
- `src/components/SearchDialog.tsx` — browser-side Orama search
- `src/components/Home.tsx` — practical platform chooser and first-issue sequence
- `src/styles/global.css` — Fumadocs presets plus BugsPort brand tokens and responsive overrides
- `src/pages/index.astro` — docs homepage
- `src/pages/docs/[...slug].astro` — statically generated documentation pages
- `src/pages/api/search.ts` — statically generated Orama search map
- `src/pages/404.astro` — branded recovery page

### AI-readable and redirect output

- `src/lib/markdown.ts` — page-to-Markdown and index generation helpers
- `src/pages/docs/[...slug].md.ts` — static Markdown form of each docs page
- `src/pages/llms.txt.ts` — concise page index
- `src/pages/llms-full.txt.ts` — complete public documentation corpus
- `src/components/LegacyRedirect.astro` — accessible static-host redirect document with canonical target
- `src/pages/docs/{legacy-route}.astro` — generated compatibility pages for useful Docusaurus URLs

### Content and API reference

- `content/docs/meta.json` — root sidebar order
- `content/docs/index.mdx` — docs introduction
- `content/docs/get-started/**` — choose platform, first issue, and verification
- `content/docs/platforms/**` — Android, iOS, REST, and Flutter status
- `content/docs/capture/**` — crashes, ANRs, network traces, context, and attachments
- `content/docs/dashboard/**` — org/team/project hierarchy, issue triage, collaboration, alerts, and integrations
- `content/docs/reference/**` — SDK configuration, privacy, troubleshooting, release status, and generated REST pages
- `openapi/bugsport.json` — reviewed REST contract snapshot
- `openapi/source.json` — source repository, path, and commit SHA
- `scripts/sync-openapi.mjs` — deterministic snapshot updater
- `scripts/generate-openapi.mjs` — Fumadocs OpenAPI MDX generator
- `src/lib/openapi.ts` — Fumadocs OpenAPI server instance used at build time
- `src/components/OpenAPIPage.tsx` — non-server-component API reference renderer

### Quality and delivery

- `scripts/check-links.mjs` — built-output internal link and redirect validation
- `tests/site.test.ts` — brand, platform, hierarchy, redirect, and banned-copy checks
- `tests/openapi-sync.test.ts` — snapshot metadata and contract integrity checks
- `tests/e2e/docs.spec.ts` — desktop and mobile navigation, search, theme, copy, 404, and wide-layout smoke tests
- `.github/workflows/ci.yml` — install, typecheck, unit tests, build, link validation, and browser smoke tests
- `README.md` — current local development, content, verification, and deployment workflow

---

### Task 1: Replace Docusaurus with the Astro/Fumadocs toolchain

**Files:**
- Modify: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `astro.config.mjs`
- Modify: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `vitest.config.ts`
- Delete: `package-lock.json`
- Delete: `docusaurus.config.ts`
- Delete: `sidebars.ts`
- Delete: `src/pages/index.tsx`
- Delete: `src/pages/index.module.css`
- Delete: `src/pages/markdown-page.mdx`
- Delete: `src/components/HomepageFeatures/index.tsx`
- Delete: `src/components/HomepageFeatures/styles.module.css`
- Delete: `src/css/custom.css`

**Interfaces:**
- Produces: `pnpm dev`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
- Produces: `@/*` resolving to `src/*`
- Consumes: no earlier task

- [ ] **Step 1: Replace the package manifest and install the pinned toolchain**

Use this script surface:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check:links": "node scripts/check-links.mjs",
    "generate:api": "node scripts/generate-openapi.mjs",
    "sync:openapi": "node scripts/sync-openapi.mjs",
    "verify": "pnpm typecheck && pnpm test && pnpm build && pnpm check:links"
  }
}
```

Pin Astro `7.1.3`, Fumadocs Core/UI `16.12.1`, React/React DOM `19.2.8`, Tailwind `4.3.3`, Orama `3.1.18`, and Fumadocs OpenAPI `11.2.2`. Add the official Astro Fumadocs dependencies from the Astro example, including `@astrojs/markdown-remark`, `@astrojs/mdx`, and `@astrojs/react`.

Run:

```bash
pnpm install
```

Delete `package-lock.json` with `apply_patch` before installing. Expected: `pnpm-lock.yaml` is created with no peer dependency errors.

- [ ] **Step 2: Configure Astro and strict TypeScript**

Use the official Fumadocs Astro plugin chain:

```js
const remarkPlugins = [
  remarkHeading,
  remarkCodeTab,
  remarkNpm,
  [remarkStructure, { exportAs: 'structuredData' }],
];
const rehypePlugins = [rehypeCode];

export default defineConfig({
  site: 'https://docs.bugsport.io',
  output: 'static',
  markdown: {
    processor: unified({
      syntaxHighlight: false,
      remarkPlugins,
      rehypePlugins,
    }),
  },
  integrations: [
    react(),
    mdx({ extendMarkdownConfig: true, syntaxHighlight: false }),
  ],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 3: Run the empty-project checks**

Run:

```bash
pnpm typecheck
```

Expected: configuration loads; missing application modules are allowed only until Task 2 creates them.

- [ ] **Step 4: Remove the old Docusaurus runtime files**

Delete the files listed above while preserving `docs/superpowers`, reusable logo assets, `.git`, and workflow history.

- [ ] **Step 5: Commit the framework migration**

```bash
git add -A
git commit -m "build: migrate docs to Astro and Fumadocs"
```

---

### Task 2: Build the content source, documentation shell, and static search

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/source.ts`
- Create: `src/lib/site.ts`
- Create: `src/lib/navigation.ts`
- Create: `src/components/BaseLayout.astro`
- Create: `src/components/Brand.tsx`
- Create: `src/components/DocsShell.tsx`
- Create: `src/components/SearchDialog.tsx`
- Create: `src/pages/docs/[...slug].astro`
- Create: `src/pages/api/search.ts`
- Create: `src/styles/global.css`
- Create: `content/docs/index.mdx`
- Create: `content/docs/meta.json`
- Test: `tests/site.test.ts`

**Interfaces:**
- Produces: `source`, a Fumadocs loader with `baseUrl: '/docs'`
- Produces: `siteConfig`, `platformPaths`, `docsSections`, and `legacyRedirects`
- Produces: `/docs/*` static pages and `/api/search` static index
- Consumes: Task 1 Astro/Fumadocs toolchain

- [ ] **Step 1: Write failing site-configuration tests**

```ts
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm test -- tests/site.test.ts
```

Expected: FAIL because `@/lib/site` does not exist.

- [ ] **Step 3: Implement typed site and navigation data**

Create literal typed data using:

```ts
export type PlatformStatus = 'available' | 'pre-alpha' | 'coming-soon';

export interface PlatformPath {
  slug: 'android' | 'ios' | 'rest-api' | 'flutter';
  title: string;
  description: string;
  href: string;
  status: PlatformStatus;
}
```

Android and iOS use `pre-alpha`, REST uses `available`, and Flutter uses `coming-soon`.

- [ ] **Step 4: Implement validated Astro collections and the Fumadocs source**

Use `glob({ pattern: '**/*.{md,mdx}', base: './content/docs' })`, validate `title`, `description`, `icon`, and `status`, and convert page/meta entries to a `StaticSource`. Set `baseUrl: '/docs'`.

- [ ] **Step 5: Implement the Fumadocs React island**

`DocsShell` must:

```tsx
<RootProvider pathname={pathname} params={params} navigate={navigate} search={{ SearchDialog }}>
  <DocsLayout
    tree={tree}
    nav={{ title: <Brand /> }}
    githubUrl="https://github.com/hash-line/bugsport-docs"
  >
    <DocsPage {...page}>{children}</DocsPage>
  </DocsLayout>
</RootProvider>
```

Enable the Fumadocs theme switch. Do not force dark mode.

- [ ] **Step 6: Implement static Orama search**

Use `createFromSource(source, { buildIndex })` in `src/pages/api/search.ts`, return `server.staticGET()`, and configure `SearchDialog` with `oramaStaticClient`.

- [ ] **Step 7: Add the initial `/docs` page and build**

The page title is `BugsPort documentation`, the description is `Integrate BugsPort, send your first issue, and diagnose mobile failures.`, and the body links to `/docs/get-started` and `/docs/platforms`.

Run:

```bash
pnpm test -- tests/site.test.ts
pnpm typecheck
pnpm build
```

Expected: all pass; `dist/docs/index.html` and the static search payload exist.

- [ ] **Step 8: Commit the documentation foundation**

```bash
git add src content tests
git commit -m "feat: add Fumadocs documentation shell"
```

---

### Task 3: Create the BugsPort-branded homepage and responsive visual system

**Files:**
- Create: `src/components/Home.tsx`
- Create: `src/pages/index.astro`
- Modify: `src/styles/global.css`
- Copy: `assets/BugsPort Logo.png` → `public/bugsport-logo.png`
- Create: `public/favicon.svg`
- Modify: `tests/site.test.ts`

**Interfaces:**
- Consumes: `siteConfig` and `platformPaths` from Task 2
- Produces: `/`, a practical integration-path homepage

- [ ] **Step 1: Add failing homepage content assertions**

Read `src/components/Home.tsx` as text and assert:

```ts
expect(home).toContain('Choose your integration');
expect(home).toContain('Send your first issue');
expect(home).not.toMatch(/npm (install|i) (?:@?bugsport)/i);
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm test -- tests/site.test.ts
```

Expected: FAIL because `Home.tsx` does not exist.

- [ ] **Step 3: Implement the homepage composition**

Use a Fumadocs home layout with:

- BugsPort Docs brand and search in the header
- Heading: `Diagnose your first issue`
- Supporting sentence: `Choose a platform, connect a project, and verify that BugsPort receives the context your team needs.`
- Four platform actions from `platformPaths`
- A three-step sequence: `Create or select a project`, `Use the project API key`, `Send and verify an issue`
- Secondary links to dashboard guides, REST reference, troubleshooting, and the app

Cards are permitted only for the four platform navigation actions.

- [ ] **Step 4: Apply BugsPort tokens and responsive constraints**

Define:

```css
:root {
  --color-fd-primary: #1267a5;
  --font-sans: 'Instrument Sans Variable', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, monospace;
}
```

Keep prose width readable, keep the shell usable at 320 px, and cap homepage content at 1440 px without leaving wide screens visually empty.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm test -- tests/site.test.ts
pnpm typecheck
pnpm build
```

Expected: PASS.

```bash
git add src public tests
git commit -m "feat: add BugsPort docs homepage"
```

---

### Task 4: Publish verified platform and first-issue guides

**Files:**
- Create: `content/docs/get-started/meta.json`
- Create: `content/docs/get-started/index.mdx`
- Create: `content/docs/get-started/choose-platform.mdx`
- Create: `content/docs/get-started/first-issue.mdx`
- Create: `content/docs/get-started/verify.mdx`
- Create: `content/docs/platforms/meta.json`
- Create: `content/docs/platforms/index.mdx`
- Create: `content/docs/platforms/android.mdx`
- Create: `content/docs/platforms/ios.mdx`
- Create: `content/docs/platforms/rest-api.mdx`
- Create: `content/docs/platforms/flutter.mdx`
- Modify: `tests/site.test.ts`

**Interfaces:**
- Consumes: BugsPort client source, iOS `Package.swift`, Maven Central release metadata, and `packages/contracts/openapi.json`
- Produces: verified platform onboarding routes

- [ ] **Step 1: Add failing content-safety tests**

```ts
for (const file of docsFiles) {
  const content = readFileSync(file, 'utf8');
  expect(content).not.toContain("implementation 'io.bugsport:bugsport-android:1.0.0'");
  expect(content).not.toContain("pod 'Bugsport'");
  expect(content).not.toContain('Bugsport.start');
  expect(content).not.toMatch(/npm (install|i) (?:@?bugsport)/i);
  expect(content).not.toContain('https://api.bugsport.com');
}
```

Also assert that `android.mdx`, `ios.mdx`, and `rest-api.mdx` contain `x-api-key`, and that `flutter.mdx` contains `Coming soon` but no installation command.

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
pnpm test -- tests/site.test.ts
```

Expected: FAIL because the new guide files do not exist.

- [ ] **Step 3: Write the start-here journey**

Every guide follows:

1. Outcome
2. Prerequisites
3. Configuration
4. Send an issue
5. Verify in BugsPort
6. Troubleshooting link

State that mobile integrations use the project ID and project API key from project settings.

- [ ] **Step 4: Write the Android pre-alpha guide**

Use the released `co.hashline:bugsport-android` artifact line and the source API:

```kotlin
val config = BugsPortConfig.Builder()
    .apiKey("YOUR_PROJECT_API_KEY")
    .projectId("YOUR_PROJECT_ID")
    .build()

BugsPort.initialize(this, config)
```

State the verified minimum Android SDK and Java/Kotlin requirements from the current `bugsport-client` Gradle files. Label the package pre-alpha and link to release status.

- [ ] **Step 5: Write the iOS pre-alpha guide**

Use Swift Package Manager with `https://github.com/hash-line/bugsport-ios.git`. Document iOS 14+, the currently published alpha binary tag, and the actual exported KMP initialization API. Clearly label the integration pre-alpha.

- [ ] **Step 6: Write the REST guide**

Use the contract endpoint:

```http
POST /v1/projects/{projectId}/issues
x-api-key: YOUR_PROJECT_API_KEY
Content-Type: application/json
```

The body is a non-empty JSON Patch array using only contract-supported `add`, `remove`, `replace`, and `test` operations. Use `validateOnly=true` as the safe verification path before creating a real issue.

- [ ] **Step 7: Write the Flutter status page**

Explain that Flutter support is in development, link to the platform overview and REST fallback, and provide no dependency name, version, or initialization API.

- [ ] **Step 8: Verify and commit**

Run:

```bash
pnpm test -- tests/site.test.ts
pnpm build
```

Expected: PASS.

```bash
git add content tests
git commit -m "docs: add verified platform setup guides"
```

---

### Task 5: Add the reproducible OpenAPI snapshot and generated REST reference

**Files:**
- Create: `openapi/bugsport.json`
- Create: `openapi/source.json`
- Create: `scripts/sync-openapi.mjs`
- Create: `scripts/generate-openapi.mjs`
- Create: `src/lib/openapi.ts`
- Create: `src/components/OpenAPIPage.tsx`
- Create: `content/docs/reference/meta.json`
- Create: `content/docs/reference/rest-api.mdx`
- Modify: `package.json`
- Test: `tests/openapi-sync.test.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: `syncOpenApi(sourcePath, sourceCommit)` behavior through the CLI
- Produces: `openapi`, a Fumadocs OpenAPI build-time instance
- Produces: generated endpoint pages under `content/docs/reference/api`
- Consumes: `/home/vesper/code/bugsport/packages/contracts/openapi.json` and its Git commit SHA

- [ ] **Step 1: Write failing snapshot integrity tests**

```ts
it('records the exact contract source', () => {
  expect(metadata.repository).toBe('hash-line/bugsport');
  expect(metadata.path).toBe('packages/contracts/openapi.json');
  expect(metadata.commit).toMatch(/^[0-9a-f]{40}$/);
});

it('documents project API-key authentication', () => {
  expect(schema.components.securitySchemes.ApiKeyAuth).toMatchObject({
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
  });
});

it('contains the issue ingestion route', () => {
  expect(schema.paths['/v1/projects/{projectId}/issues'].post).toBeDefined();
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
pnpm test -- tests/openapi-sync.test.ts
```

Expected: FAIL because the snapshot does not exist.

- [ ] **Step 3: Implement the snapshot sync script**

The script accepts:

```bash
pnpm sync:openapi -- /home/vesper/code/bugsport
```

It must:

1. Resolve `<checkout>/packages/contracts/openapi.json`.
2. Run `git -C <checkout> rev-parse HEAD`.
3. Parse and validate OpenAPI `3.1.x`.
4. Sort object keys only when it preserves schema semantics; preserve arrays.
5. Write `openapi/bugsport.json`.
6. Write `openapi/source.json` with repository, path, commit, and synchronized timestamp.

- [ ] **Step 4: Sync the current contract and pass the tests**

Run:

```bash
pnpm sync:openapi -- /home/vesper/code/bugsport
pnpm test -- tests/openapi-sync.test.ts
```

Expected: PASS and metadata commit equals the current BugsPort checkout SHA.

- [ ] **Step 5: Generate Fumadocs REST pages**

Create:

```ts
export const openapi = createOpenAPI({
  input: ['./openapi/bugsport.json'],
});
```

Use `generateFiles()` to write generated pages to `content/docs/reference/api`. Clean only that generated directory before regeneration. Include descriptions and never hand-edit generated files.

Update the build script only after the generator exists:

```json
"build": "pnpm generate:api && astro build"
```

- [ ] **Step 6: Add the OpenAPI renderer and styling**

Import `fumadocs-openapi/css/preset.css`. Preload each generated page at Astro build time and render it through `OpenAPIPage` without enabling credential-bearing “try it” requests.

- [ ] **Step 7: Build and commit**

Run:

```bash
pnpm generate:api
pnpm test
pnpm typecheck
pnpm build
```

Expected: generated REST endpoint routes exist and build statically.

```bash
git add openapi scripts src content tests
git commit -m "feat: generate REST reference from OpenAPI"
```

---

### Task 6: Add product workflow, diagnostic, troubleshooting, and AI-readable content

**Files:**
- Create: `content/docs/capture/meta.json`
- Create: `content/docs/capture/crashes.mdx`
- Create: `content/docs/capture/anrs.mdx`
- Create: `content/docs/capture/network-traces.mdx`
- Create: `content/docs/capture/context-and-attachments.mdx`
- Create: `content/docs/dashboard/meta.json`
- Create: `content/docs/dashboard/organizations-teams-projects.mdx`
- Create: `content/docs/dashboard/issue-triage.mdx`
- Create: `content/docs/dashboard/collaboration.mdx`
- Create: `content/docs/dashboard/alerts.mdx`
- Create: `content/docs/dashboard/integrations.mdx`
- Create: `content/docs/reference/android-configuration.mdx`
- Create: `content/docs/reference/ios-configuration.mdx`
- Create: `content/docs/reference/data-and-privacy.mdx`
- Create: `content/docs/reference/troubleshooting.mdx`
- Create: `content/docs/reference/release-status.mdx`
- Create: `src/lib/markdown.ts`
- Create: `src/pages/docs/[...slug].md.ts`
- Create: `src/pages/llms.txt.ts`
- Create: `src/pages/llms-full.txt.ts`
- Modify: `tests/site.test.ts`

**Interfaces:**
- Produces: `renderPageMarkdown(page)`, `renderLlmsIndex()`, and `renderLlmsFull()`
- Produces: `/docs/<path>.md`, `/llms.txt`, and `/llms-full.txt`
- Consumes: `source` from Task 2 and verified application behavior

- [ ] **Step 1: Add failing content and Markdown-output tests**

Assert:

```ts
expect(requiredRoutes).toEqual(expect.arrayContaining([
  '/docs/capture/crashes',
  '/docs/dashboard/organizations-teams-projects',
  '/docs/reference/troubleshooting',
]));
expect(renderLlmsIndex()).toContain('/docs/platforms/android');
expect(renderLlmsFull()).toContain('# BugsPort documentation');
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
pnpm test
```

Expected: FAIL because content and Markdown helpers do not exist.

- [ ] **Step 3: Write only source-backed diagnostic guides**

Describe crashes, ANRs, network traces, context, and attachments only where the BugsPort contracts or client source exposes them. If a client-side capture API is incomplete, explain the current capability and direct users to REST ingestion instead of inventing an SDK method.

- [ ] **Step 4: Write dashboard workflow guides**

Use the current web routes and UI labels as source:

- organizations → teams → projects hierarchy
- issues, views, filters, assignment, and issue detail
- comments and collaboration
- project alerts
- connected integrations

Do not document unreleased custom dashboards as stable behavior.

- [ ] **Step 5: Write configuration, privacy, troubleshooting, and release status**

Release status must identify Android and iOS as pre-alpha and Flutter as coming soon. Privacy content lists categories visible in current crash, ANR, trace, issue, and attachment contracts without making unsupported retention or compliance claims.

- [ ] **Step 6: Generate AI-readable static output**

`renderPageMarkdown` emits:

```md
# {title}

Source: https://docs.bugsport.io{page.url}

{processed page body}
```

`llms.txt` is a title/description/link index. `llms-full.txt` concatenates all public pages in sidebar order. Both are generated from the same source collection as the site.

- [ ] **Step 7: Verify and commit**

Run:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: PASS and `dist/llms.txt`, `dist/llms-full.txt`, and Markdown page files exist.

```bash
git add content src tests
git commit -m "docs: add product workflows and AI-readable output"
```

---

### Task 7: Add compatibility routes, failure states, link validation, browser tests, and CI

**Files:**
- Create: `src/components/LegacyRedirect.astro`
- Create: `src/pages/docs/intro.astro`
- Create: `src/pages/docs/getting-started.astro`
- Create: `src/pages/docs/installation.astro`
- Create: `src/pages/docs/quickstart.astro`
- Create: `src/pages/docs/android-setup.astro`
- Create: `src/pages/docs/ios-setup.astro`
- Create: `src/pages/docs/github-pages.astro`
- Create: `src/pages/docs/contributing.astro`
- Create: `src/pages/404.astro`
- Create: `scripts/check-links.mjs`
- Create: `playwright.config.ts`
- Create: `tests/e2e/docs.spec.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml`
- Create: `public/CNAME`
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Produces: `pnpm verify` as the release gate
- Produces: CI validation on pushes and pull requests
- Consumes: complete static site from Tasks 1–6

- [ ] **Step 1: Add static legacy compatibility routes**

Create a shared redirect document that renders a canonical link, a zero-delay meta refresh, a clear manual link, and a small client-side `location.replace()` enhancement. Use it to map:

```text
/docs/intro                 /docs
/docs/getting-started       /docs/get-started
/docs/installation          /docs/get-started
/docs/quickstart            /docs/get-started/first-issue
/docs/android-setup         /docs/platforms/android
/docs/ios-setup             /docs/platforms/ios
/docs/github-pages          /docs
```

Redirect `/docs/contributing` to `https://github.com/hash-line/bugsport-docs`.

- [ ] **Step 2: Implement built-output link validation**

The script walks `dist/**/*.html`, extracts same-origin `href` values, ignores fragments and allowed external schemes, resolves trailing-slash/index paths, and fails with every missing target in one report. It also validates that every declared legacy route produces an HTML file with the expected canonical replacement.

- [ ] **Step 3: Write browser smoke tests**

Tests cover:

```ts
test('routes developers from homepage to Android setup', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Android/ }).click();
  await expect(page).toHaveURL(/\/docs\/platforms\/android/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Android');
});
```

Also test:

- `Ctrl+K`/`Meta+K` search opens and finds “project API key”
- theme switching
- code-copy feedback
- mobile navigation at 390×844
- wide layout at 1920×1080
- 404 recovery links
- no horizontal overflow at all configured viewports

- [ ] **Step 4: Configure CI**

Use Node.js 24 and pnpm 10. Run:

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm typecheck
- run: pnpm test
- run: pnpm build
- run: pnpm check:links
- run: pnpm exec playwright install --with-deps chromium
- run: pnpm test:e2e
```

Keep validation and production publishing as separate jobs. The Pages workflow must depend on a successful production build and upload only `dist`.

- [ ] **Step 5: Update contributor documentation**

README must contain exact local commands, content locations, source-audit rules, OpenAPI sync command, full verification command, and GitHub Pages deployment workflow.

- [ ] **Step 6: Run the release gate and commit**

Run:

```bash
pnpm verify
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: all pass.

```bash
git add -A
git commit -m "test: add docs release verification"
```

---

### Task 8: Configure GitHub Pages, inspect the finished UI, deploy, and validate production

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `public/CNAME`
- Modify: `README.md`

**Interfaces:**
- Produces: production GitHub Pages deployment
- Produces: `https://docs.bugsport.io`
- Consumes: verified `dist` output from Task 7, repository Pages permissions, and the existing Cloudflare DNS record

- [ ] **Step 1: Configure the GitHub Pages artifact deployment**

Update `.github/workflows/deploy.yml` to use Node.js 24, pnpm 10, and the committed lockfile. The workflow must run on pushes to `main` and through `workflow_dispatch`, run `pnpm verify`, upload `dist` with `actions/upload-pages-artifact`, and deploy it with `actions/deploy-pages`.

Create `public/CNAME`:

```text
docs.bugsport.io
```

- [ ] **Step 2: Verify repository Pages and DNS configuration**

Run:

```bash
gh api repos/hash-line/bugsport-docs/pages
dig +short @1.1.1.1 docs.bugsport.io A
curl -4 -sSIL https://docs.bugsport.io/
```

Expected: GitHub Pages uses workflow builds, has `docs.bugsport.io` configured, reports `https_enforced: true` and an approved certificate, and the existing Cloudflare-proxied hostname reaches GitHub Pages successfully. Do not change the working DNS record.

- [ ] **Step 3: Run final local verification**

Run:

```bash
pnpm verify
pnpm test:e2e
git status --short
```

Expected: all pass and only intentional Pages configuration changes remain.

- [ ] **Step 4: Inspect the site in the browser before deployment**

Run the production preview and inspect:

- `/`
- `/docs`
- `/docs/platforms/android`
- `/docs/platforms/ios`
- `/docs/platforms/rest-api`
- a generated REST endpoint page
- `/404`

Check 390×844, 1440×900, and 1920×1080. Fix visual defects before deployment and rerun `pnpm verify`.

- [ ] **Step 5: Commit and push the completed rebuild**

```bash
git add .github/workflows/deploy.yml public/CNAME README.md
git commit -m "ops: deploy docs with GitHub Pages"
git push -u origin feat/fumadocs-rebuild
```

- [ ] **Step 6: Deploy the saved source state**

Run:

```bash
gh workflow run deploy.yml --ref feat/fumadocs-rebuild
gh run watch --exit-status
```

Expected: the Pages build and deploy jobs pass and report the production page URL. If the repository environment only allows `main`, merge the reviewed branch before triggering the workflow rather than weakening the environment protection.

- [ ] **Step 7: Validate production**

Run:

```bash
curl -4 -sSIL https://docs.bugsport.io/
curl -4 -sSIL https://docs.bugsport.io/docs/platforms/android
curl -4 -sSIL https://docs.bugsport.io/docs/android-setup
curl -4 -sSIL https://docs.bugsport.io/llms.txt
```

Expected:

- homepage and current docs routes return `200`
- legacy Android route reaches `/docs/platforms/android` through the generated static compatibility page
- `llms.txt` returns `200` with `text/plain`
- static assets return `200`
- browser production smoke tests pass

- [ ] **Step 8: Record deployment evidence**

Capture the GitHub Actions run URL, production URL, source commit SHA, verification commands, and any remaining content limitations in the task handoff.
