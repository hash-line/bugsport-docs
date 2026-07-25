# BugsPort Fumadocs Rebuild Design

**Date:** 2026-07-26  
**Status:** Approved for planning  
**Repository:** `hash-line/bugsport-docs`  
**Production URL:** `https://docs.bugsport.io`

## Objective

Replace the starter Docusaurus site with a polished, developer-first documentation product built with Astro and Fumadocs. The new site must help an Android, iOS, Flutter, or REST API developer move from a BugsPort project to a verified first issue with minimal friction.

The documentation must describe behavior that exists in the relevant product repositories. It must not publish guessed package names, versions, methods, configuration options, or API behavior.

## Success Criteria

- A new developer can choose a platform from the docs homepage and reach the correct setup guide immediately.
- Android, iOS, and REST setup guides are verified against current source code and contracts.
- Flutter is visible but clearly marked as coming soon until its package is released.
- No JavaScript package is implied or advertised.
- Search, navigation, code copying, table of contents, dark mode, and mobile navigation work in production.
- Existing useful Docusaurus URLs reach their new equivalents through generated static compatibility pages.
- The site builds statically and deploys through GitHub Pages at `docs.bugsport.io`.
- Broken internal links, invalid content metadata, and failed production builds block deployment.

## Audience and Priority

The primary audience is developers integrating BugsPort into a mobile application or a REST client:

1. Android developers
2. iOS developers
3. REST API consumers, including mobile clients that authenticate with a project API key rather than a logged-in user
4. Flutter developers preparing for the upcoming package

Dashboard users, team administrators, and integration operators are secondary audiences. Their guides remain accessible but do not compete with the integration path on the homepage.

## Visual Thesis

BugsPort Docs should feel like a focused engineering console: neutral surfaces, crisp type, a restrained BugsPort blue accent, dense but calm navigation, and code as the primary visual material. The result should retain Fumadocs’ polished interaction model while being unmistakably BugsPort.

The site will support light and dark themes. It will use the BugsPort logo and brand tokens already established by the product and marketing site. It will not use generic Docusaurus illustrations, decorative gradients, dashboard mosaics, or promotional card grids.

## Content Plan

### Homepage

The homepage has one job: route developers into the correct setup path.

It contains:

- BugsPort Docs identity and global search
- A concise heading explaining that the docs cover crash and bug reporting integration
- Platform paths for Android, iOS, REST API, and Flutter
- A short “first issue” sequence: create/select project, obtain project API key, integrate, verify
- Direct links to dashboard guides, API reference, troubleshooting, and GitHub

Platform paths may use compact link cards because each card is a navigation action. The homepage will not reuse the marketing landing page hero or attempt to sell the product.

### Documentation Navigation

The sidebar is explicitly ordered rather than generated from filenames:

1. **Start here**
   - Introduction
   - Choose a platform
   - Send your first issue
   - Verify the integration
2. **Platforms**
   - Android
   - iOS
   - REST API
   - Flutter — Coming soon
3. **Capture and diagnose**
   - Crashes
   - ANRs and hangs
   - Network traces
   - User and app context
   - Attachments and breadcrumbs
4. **Dashboard and workflow**
   - Organizations, teams, and projects
   - Issue triage
   - Comments and collaboration
   - Alerts
   - Integrations
5. **Reference**
   - REST API
   - Android configuration
   - iOS configuration
   - Data collection and privacy
   - Troubleshooting
   - Release notes

Only sections supported by verified product behavior will be published. Unsupported draft topics remain out of navigation until the feature and its documentation are ready.

### Page Anatomy

Every task guide uses the same reading order:

1. Outcome and prerequisites
2. Numbered implementation steps
3. Copyable code or request examples
4. Verification instructions
5. Common failure modes
6. Relevant next step

Reference pages prioritize accurate signatures, request/response fields, constraints, defaults, and version applicability. Marketing claims do not belong in reference pages.

## Architecture

### Framework

- Astro
- Fumadocs Core and Fumadocs UI rendered through React islands
- Astro content collections for Markdown and MDX
- Tailwind CSS 4
- Orama static client search
- pnpm and Node.js 22 or newer

Astro is the site framework. Fumadocs provides the documentation layout, navigation, page components, search interface, code presentation, and supporting interactions. React is limited to islands that require Fumadocs interactivity.

### Rendering and Hosting

All documentation pages and search indexes are generated at build time. The output is static HTML, CSS, JavaScript, and assets.

GitHub Actions builds the site and GitHub Pages serves the generated `dist` artifact. The repository's Pages custom domain is `docs.bugsport.io`; Cloudflare remains the authoritative DNS provider and points that subdomain directly to the Hashline organization Pages domain. No Wrangler deployment, Next.js server, database, or origin runtime is required.

Deployments are atomic: a failed build or failed validation cannot replace the currently deployed version.

### Content Source

Public documentation lives in this repository under `content/docs`.

Product truth comes from:

- Android package repository and released artifacts
- iOS package repository and released artifacts
- Flutter repository when available
- BugsPort REST OpenAPI contract
- BugsPort web application behavior for dashboard guides

The rebuild must audit these sources before rewriting setup instructions. The current Docusaurus examples are migration input only and are not treated as authoritative.

### OpenAPI

The REST reference will consume a reviewed snapshot of the BugsPort OpenAPI document stored in this repository. A sync script copies `packages/contracts/openapi.json` from a local BugsPort application checkout and records the source commit SHA alongside the snapshot. The docs build remains independent of another repository or network service, while updates stay reproducible and reviewable. Generated reference output is not edited manually.

## Components and Boundaries

- **Site shell:** global navigation, product links, theme, search trigger, and responsive layout
- **Docs layout:** sidebar, breadcrumbs, page table of contents, previous/next navigation, and page actions
- **Homepage:** platform routing and first-issue journey
- **Content source:** loads validated Markdown, MDX, and navigation metadata
- **Search:** generates a static Orama index and runs queries in the browser
- **Reference rendering:** presents reviewed OpenAPI content separately from task-oriented guides
- **Deployment:** builds, validates, and publishes immutable static assets

Each component owns one responsibility. Content files do not contain site-wide navigation logic, and deployment configuration does not define documentation structure.

## Interaction Thesis

Interaction is restrained and functional:

- `⌘K` or `Ctrl+K` opens global search with keyboard navigation.
- Sidebar sections expand predictably and maintain a clear active-page state.
- Code copy actions provide immediate success feedback.
- Theme selection persists across visits.
- Mobile navigation uses a focused drawer with large touch targets.

No ornamental entrance sequences or scroll effects are required. Documentation motion should clarify state, not decorate routine reading.

## Legacy URL Handling

GitHub Pages cannot emit origin-level HTTP redirects from a static artifact, so the build preserves useful incoming links with generated compatibility pages. Each page immediately navigates to the replacement route and includes the replacement as its canonical URL:

- `/docs/intro` → `/docs`
- `/docs/getting-started` → `/docs/get-started`
- `/docs/installation` → `/docs/get-started`
- `/docs/quickstart` → `/docs/get-started/quickstart`
- `/docs/android-setup` → `/docs/platforms/android`
- `/docs/ios-setup` → `/docs/platforms/ios`
- `/docs/github-pages` → `/docs`

The former contributor page will point to repository contribution guidance if public contribution documentation remains relevant; otherwise it will redirect to the repository.

## Error Handling

- Invalid frontmatter or navigation metadata fails the build.
- Broken internal links fail CI.
- Missing required assets fail the build rather than rendering broken placeholders.
- Unknown documentation routes show a branded 404 with search and links to platform setup.
- Search failures preserve normal sidebar and page navigation.
- A deployment failure leaves the previous GitHub Pages version active.

## Testing and Verification

### Automated

- Type checking
- Astro content validation
- Production static build
- Broken-link validation
- Unit tests for navigation and redirect mappings where logic exists
- Browser smoke tests for homepage, each platform route, search, theme switching, code copying, and mobile navigation
- Viewport checks at representative mobile, laptop, and wide desktop sizes

### Content Accuracy

- Every installation command and API example is checked against its source repository or released artifact.
- Every REST request is checked against the OpenAPI contract.
- Authentication examples use a project API key and do not imply a logged-in mobile user.
- Version requirements and platform minimums are stated only when verified.

### Production

After deployment:

- Confirm DNS resolution and TLS.
- Confirm `/`, core documentation routes, static assets, and redirects return expected status codes.
- Run a browser smoke pass against `https://docs.bugsport.io`.
- Confirm search results navigate to production pages.
- Confirm mobile and wide-screen layouts visually.

## Delivery Sequence

1. Replace Docusaurus tooling with Astro and Fumadocs.
2. Establish the BugsPort shell, content source, navigation, search, and redirects.
3. Audit Android, iOS, REST, and dashboard sources.
4. Rewrite the homepage and core setup content using verified behavior.
5. Add reference, troubleshooting, privacy, and workflow content supported by current behavior.
6. Add validation and browser smoke tests.
7. Build and verify locally.
8. Deploy through GitHub Pages and validate production.
9. Commit and push the completed rebuild.

## Explicitly Deferred

- Hosted AI chat or “Ask BugsPort”
- Localization
- User-specific or authenticated documentation
- Interactive API requests that transmit production credentials
- Automated SDK reference generation beyond the reviewed REST OpenAPI reference
- Flutter installation instructions before the package is released

Static `llms.txt`, Markdown-accessible page output, and copy-page actions are part of v1. They are generated at build time and do not require an AI service or server runtime.
