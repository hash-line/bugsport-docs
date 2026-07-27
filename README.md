# BugsPort Docs

[![Verify documentation](https://github.com/hash-line/bugsport-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/hash-line/bugsport-docs/actions/workflows/ci.yml)
[![Deploy documentation](https://github.com/hash-line/bugsport-docs/actions/workflows/deploy.yml/badge.svg)](https://github.com/hash-line/bugsport-docs/actions/workflows/deploy.yml)

The source for the official [BugsPort documentation](https://docs.bugsport.io/). It helps mobile teams integrate BugsPort, send their first issue, and diagnose crashes, ANRs, network failures, and related app problems.

Built as a static site with [Astro](https://astro.build/) and [Fumadocs](https://fumadocs.dev/), with a generated REST API reference and production deployment through GitHub Pages.

## Links

- [Documentation](https://docs.bugsport.io/)
- [BugsPort](https://www.bugsport.io/)
- [BugsPort app](https://app.bugsport.io/)
- [Main repository](https://github.com/hash-line/bugsport)

## Platform status

| Platform | Status | Documentation |
| --- | --- | --- |
| Android | Pre-alpha | [Android integration](https://docs.bugsport.io/platforms/android/) |
| iOS | Pre-alpha | [iOS integration](https://docs.bugsport.io/platforms/ios/) |
| REST API | Available | [REST API integration](https://docs.bugsport.io/platforms/rest-api/) |
| Flutter | Coming soon | [Flutter status](https://docs.bugsport.io/platforms/flutter/) |

Mobile and REST ingestion uses a project-scoped `x-api-key`. The documentation does not describe mobile clients as authenticated user sessions.

## Development

### Requirements

- Node.js 24
- pnpm 10

Install the locked dependency graph and start the local server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Build and preview the production output:

```bash
pnpm build
pnpm preview
```

## Content

Public documentation lives in [`content/docs`](content/docs). Directory-level `meta.json` files define the navigation tree.

Important supporting files:

- [`openapi/bugsport.json`](openapi/bugsport.json) — reviewed REST contract snapshot
- [`openapi/source.json`](openapi/source.json) — source commit, generator, and digest provenance
- [`scripts/sync-openapi.mjs`](scripts/sync-openapi.mjs) — reproducible OpenAPI synchronization
- [`scripts/generate-openapi.mjs`](scripts/generate-openapi.mjs) — generated Fumadocs endpoint pages
- [`src/styles/global.css`](src/styles/global.css) — shared site styling
- [`tests`](tests) — content, generation, link, and browser coverage

Treat current product source and reviewed contracts as authoritative. Before changing SDK commands, versions, platform support, dashboard behavior, authentication, or REST examples, verify the claim against its source or released artifact.

Generated files under `content/docs/reference/api` must not be edited manually.

## OpenAPI reference

Use a clean checkout of the main BugsPort repository:

```bash
pnpm sync:openapi -- /path/to/bugsport
pnpm generate:api
```

The sync command rejects a dirty source checkout, runs the contract generator, and records the source commit, generator command, and output digest. Review the snapshot, provenance, and generated pages together.

## Verification

Run the complete static release gate:

```bash
pnpm verify
```

Run the browser suite:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm verify` performs type checking, unit tests, a clean static build, OpenAPI generation, and internal-link validation.

## Deployment

The site deploys to [docs.bugsport.io](https://docs.bugsport.io/) through GitHub Pages.

Every push to `main`:

1. Installs the frozen dependency graph.
2. Runs the static verification gate.
3. Runs Chromium browser tests.
4. Uploads the generated `dist` artifact.
5. Deploys through the protected `github-pages` environment.

The deployment can also be started manually from **Actions → Deploy documentation to GitHub Pages → Run workflow**. Production deployments must use `main`.
