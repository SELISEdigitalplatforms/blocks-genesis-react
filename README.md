# blocks-genesis-react (Blocks Kit)

A package-first pnpm monorepo for reusable React building blocks. Its main product is the npm package [`@seliseblocks/genesis-os`](https://www.npmjs.com/package/@seliseblocks/genesis-os), the shared app-shell and component foundation consumed by the SELISE Blocks service applications (IAM, OS, Data, Logic, Monitor, Release, Studio, Utilities, Localization).

## Workspace Layout

| Path                                                 | Purpose                                                                                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/compose-react`](./packages/compose-react) | The `@seliseblocks/genesis-os` package: guards, layouts, providers, pages, stores, hooks, HTTP client, and shadcn/Radix based components |
| `tooling/eslint`                                     | Shared ESLint config (`@blocks-kit/eslint-config`)                                                                                       |
| `tooling/prettier`                                   | Shared Prettier config (`@blocks-kit/prettier-config`)                                                                                   |
| `tooling/typescript`                                 | Shared TypeScript configs (`@blocks-kit/tsconfig`)                                                                                       |

- [packages/compose-react](./packages/compose-react): React composition package built on Radix UI primitives with app-shell utilities (published as `@seliseblocks/genesis-os`)
- tooling/\*: Shared ESLint, Prettier, and TypeScript configs

## Requirements

- Node.js 20 or later (`engines` in `package.json`; CI publishes with Node 22)
- pnpm 11 (`packageManager` pins `pnpm@11.1.1`)

This is a pnpm workspace with Turborepo. Do not use npm or yarn here; `pnpm-lock.yaml` is the only lockfile.

## Getting Started

```bash
pnpm install --frozen-lockfile
pnpm build
```

Workspace-wide tasks run through Turborepo:

```bash
pnpm build        # build all packages
pnpm lint         # lint all packages
pnpm typecheck    # typecheck all packages
pnpm dev          # build and watch
```

Scope any task to the package with `--filter`:

```bash
pnpm --filter @seliseblocks/genesis-os build
pnpm --filter @seliseblocks/genesis-os test
```

Tests are Vitest (jsdom + Testing Library) and live next to the source files in `packages/compose-react/src`.

## Styling Contract

`@seliseblocks/genesis-os` intentionally does not ship CSS files. Host applications are responsible for:

Host applications are responsible for:

- Tailwind setup
- shared design tokens (CSS variables) for theming
- Any global CSS imports required by their design system

See the [package README](./packages/compose-react/README.md#styling-contract) for the exact Tailwind configuration.

## Versioning and Publishing

Versioning and publishing use [Changesets](https://github.com/changesets/changesets), through the scripts defined in the root `package.json`:

```bash
pnpm changeset          # record a changeset describing your change
pnpm version-packages   # apply pending changesets to package versions
pnpm release            # build and publish (CI does this; see below)
```

Publishing runs in CI via `.github/workflows/publish.yml` using npm Trusted Publishing (OIDC); no npm tokens are stored in the repository. `changeset publish` only publishes versions that are not already on npm.

The package is on a `0.0.x` release line; while the major version is 0, any release may contain breaking changes. Exports of `@seliseblocks/genesis-os` are consumed by ten downstream Blocks repositories and are treated as a public API: see [CONTRIBUTING.md](./CONTRIBUTING.md) before changing any exported name, signature, type, or default.

## Local Development Against an Application

To test unpublished changes inside a consuming application, point the app's dependency at your local build:

```json
{
  "dependencies": {
    "@seliseblocks/genesis-os": "file:../blocks-genesis-react/packages/compose-react"
  }
}
```

Then rebuild on change with `pnpm --filter @seliseblocks/genesis-os dev` and reinstall in the application (delete its `node_modules` and lockfile-managed install first if the package manager caches the old copy).

## Repository Documentation

- [Package README](./packages/compose-react/README.md): using `@seliseblocks/genesis-os`
- [CONTRIBUTING.md](./CONTRIBUTING.md): branch model, commit conventions, tests, API stability rules
- [SECURITY.md](./SECURITY.md): supported versions and vulnerability reporting
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## License

[MIT](./LICENSE) (c) SELISE Blocks
