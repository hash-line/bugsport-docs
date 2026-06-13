# Bugsport Docs

Documentation site for Bugsport, built with Docusaurus and intended for GitHub Pages hosting.

## Requirements

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Run Locally

```bash
npm start
```

The local dev server runs at http://localhost:3000/bugsport-docs/ and hot-reloads while you edit docs.

## Build

```bash
npm run build
```

This generates static output in `build/`.

## Deploy To GitHub Pages

```bash
GIT_USER=hash-line npm run deploy
```

The deploy command builds the site and pushes the output to the `gh-pages` branch.
