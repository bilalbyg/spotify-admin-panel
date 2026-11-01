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

## Commit Messages

Use Conventional Commit subjects in `<type>: <description>` format, for example
`feat: add bulk song creation`. Keep commit types unscoped.

Commits must use the personal identity `Bilal Beygo <bbeygo.71@gmail.com>`.
Never commit with the GitLab/work account (`bmbeygo@netas.com.tr` or any work
address).

## Change Discipline

Prefer the smallest complete change that solves the requested problem. Keep the
scope focused on the behavior and files required for that solution.

## Safety Rules

- Keep admin authentication and API configuration in application/runtime
  configuration, not credentials embedded in source.
- Do not weaken lint or test gates to make a Jenkins build green; fix the
  reported code or document a narrowly scoped exception.
- Validate the replacement container before considering a deployment complete.

Read the workspace `llm-wiki/architecture.md`, `llm-wiki/delivery.md`, and
`llm-wiki/guardrails.md` before changing release behavior.
