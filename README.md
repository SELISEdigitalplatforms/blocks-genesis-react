# Blocks Kit

A package-first monorepo for reusable React building blocks.

## Current Workspace Scope

This repository now contains only reusable packages:

- packages/compose-react: React composition package with shadcn-based components and app-shell utilities
- packages/core: Core runtime/auth/http utilities
- packages/hooks: Shared React hooks
- packages/primitives: Framework-agnostic primitives/utilities
- tooling/*: Shared ESLint, Prettier, and TypeScript configs

Removed from this repo:

- packages/ui
- packages/cli
- apps/*

## Styling Contract

compose-react intentionally does not ship CSS files.

Host applications are responsible for:

- Tailwind setup
- shadcn token/theme variables
- Any global CSS imports required by their design system

## Quick Start

Requirements:

- Node 20+
- pnpm 11+

Install and run workspace checks:

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
```

## Package Development

Build a single package:

```bash
pnpm --filter @blocks-kit/compose-react build
```

Typecheck a single package:

```bash
pnpm --filter @blocks-kit/compose-react typecheck
```
