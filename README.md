# Blocks Kit

A package-first monorepo for reusable React building blocks.

## Current Workspace Scope

This repository contains reusable packages:

- [packages/compose-react](./packages/compose-react): React composition package with shadcn-based components and app-shell utilities (published as `@selisedigitalplatforms/blocks-kit`)
- tooling/\*: Shared ESLint, Prettier, and TypeScript configs

## Documentation

- [Package README](./packages/compose-react/README.md) - Developer guide for using @selisedigitalplatforms/blocks-kit
- [Project Conventions](./PROJECT_CONVENTIONS.md) - Coding standards and architectural patterns
- [Design System](./packages/compose-react/design.md) - Blocks design system guide
- [AI Agent Instructions](./.trae/agent-instructions.md) - Guidelines for AI contributors

## Styling Contract

compose-react intentionally does not ship CSS files.

Host applications are responsible for:

- Tailwind setup
- shadcn token/theme variables
- Any global CSS imports required by their design system

## Quick Start (Monorepo Development)

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
pnpm --filter @selisedigitalplatforms/blocks-kit build
```

You can also build all packages at once:

```bash
pnpm build
```

Typecheck a single package:

```bash
pnpm --filter @selisedigitalplatforms/blocks-kit typecheck
```

## Package Publish

This repo uses [Changesets](https://changesets.com/) for versioning and publishing.

### Create a changeset

```bash
pnpm changeset
```

### Version packages

```bash
pnpm version-packages
```

### Publish to npm

```bash
pnpm release
```

**Note:** You may need to login to npm package registry before publishing using `npm login` in the terminal.

## Development Workflow

- Build and watch a single package:

```bash
pnpm --filter @selisedigitalplatforms/blocks-kit dev
```

- Build and watch all packages:

```bash
pnpm dev
```

- Update the package.json of your application to reference the latest version of compose-react:

```json
{
  "dependencies": {
    "@selisedigitalplatforms/blocks-kit": "file:./path/to/blocks-kit/packages/compose-react"
  }
}
```

- Re-install dependencies inside your application. You may need to delete the `node_modules` directory and `package-lock.json` first.

```bash
npm install
```

- Now you can run your application as usual.

```bash
npm run dev
```

**Note:** Making changes to the package will be reflected in your application every time the package completes a build.
