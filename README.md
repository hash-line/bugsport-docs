# BugsPort Docs

Static developer documentation for BugsPort, built with Astro and Fumadocs.

## Requirements

- Node.js 24
- pnpm 10

Install the locked dependency graph:

```bash
pnpm install --frozen-lockfile
```

## Local development

Start the documentation server:

```bash
pnpm dev
```

Build and inspect the generated static output:

```bash
pnpm build
pnpm preview
```

## Content and source audit

Public documentation lives in [`content/docs`](content/docs). Keep the navigation metadata in each directory’s `meta.json` aligned with the public page tree.

Treat the current product repositories and reviewed contracts as the source of truth. The previous Docusaurus content is migration input only. Before changing installation commands, SDK APIs, versions, platform support, dashboard behavior, or REST examples, audit the corresponding product source or released artifact. Do not invent package names, client methods, fields, authentication flows, or availability claims. Mobile ingestion uses the project-scoped `x-api-key`; do not describe a logged-in mobile session as authentication.

Flutter remains coming soon until a released package exists. Generated REST pages under `content/docs/reference/api` come from the checked-in OpenAPI snapshot and must not be edited by hand.

## OpenAPI workflow

Refresh the reviewed snapshot from a local BugsPort checkout, then regenerate the reference pages:

```bash
pnpm sync:openapi -- /home/vesper/code/bugsport
pnpm generate:api
```

Review `openapi/source.json`, `openapi/bugsport.json`, and the generated documentation changes together before committing.

## Verification

The local release gate always rebuilds `dist` before validating it, so it cannot rely on stale output:

```bash
pnpm verify
```

Run the Chromium browser suite after installing its browser binary:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

For a complete local release check, run both commands in order:

```bash
pnpm verify
pnpm exec playwright install chromium
pnpm test:e2e
```

## Deployment

Production publishing migration is not configured on this branch. The checked-in GitHub Pages workflow is still the legacy Docusaurus/npm workflow and is not compatible with this Astro `dist` output. Task 8 will replace that workflow after verification. The verification workflow only validates source and static output; it does not publish production pages.
