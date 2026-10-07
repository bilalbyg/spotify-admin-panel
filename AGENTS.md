# Admin Panel Contribution Guide

## Scope

This file applies to the React/Vite administration UI, its Docker image, Nginx
reverse proxy, tests, and Jenkins pipeline.

## Development Gates

Run from this directory:

```bash
npm ci
npm run lint
npm test
npm run build
```

Vitest is the current automated test command. Keep tests deterministic and do
not require a live backend for unit/component coverage.

The production container serves the Vite output through Nginx and proxies API
and media paths to the backend gateway and MinIO host ports. The default host
port is `3002`.

## Safety Rules

- Keep admin authentication and API configuration in application/runtime
  configuration, not credentials embedded in source.
- Do not weaken lint or test gates to make a Jenkins build green; fix the
  reported code or document a narrowly scoped exception.
- Validate the replacement container before considering a deployment complete.

Read the workspace `llm-wiki/architecture.md`, `llm-wiki/delivery.md`, and
`llm-wiki/guardrails.md` before changing release behavior.
