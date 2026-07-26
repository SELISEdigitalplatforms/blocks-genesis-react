# Contributing to blocks-genesis-react

Thank you for your interest in contributing to **blocks-genesis-react** (Blocks Kit)! Whether you're reporting a bug, suggesting an enhancement, or submitting code changes, we welcome your input.

## Public API Stability

This repository ships the `@seliseblocks/blocks-kit` npm package, which is consumed by ten downstream SELISE Blocks service repositories. **Any change to a public API is a breaking change for all of them.** That includes renaming or removing an export (from the main entry or any subpath such as `./components`, `./hooks`, `./guards`, `./layouts`, `./lib`, `./providers`, `./pages`, `./store`, `./utils`, `./models`, `./types`), changing a signature, prop type, exported type, or default value, and changing observable behavior of an exported symbol. Do not make such a change casually: propose it in an issue first, and expect it to require a coordinated release across all consumers.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Issues](#reporting-issues)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Git Guidelines](#git-guidelines)
- [Testing](#testing)
- [Releasing](#releasing)
- [Repository Conventions](#repository-conventions)
- [Code Review Process](#code-review-process)
- [License](#license)

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

## How to Contribute

### Reporting Issues

If you encounter a bug or have a feature request, please [open an issue](https://github.com/SELISEdigitalplatforms/blocks-genesis-react/issues/new) and include:

- **Description**: A clear and concise description of the problem or proposal.
- **Steps to Reproduce**: For bugs, steps to replicate the issue, ideally with a minimal snippet.
- **Expected Behavior**: What should happen.
- **Actual Behavior**: What actually happens.
- **Environment**: Package version, React version, bundler, Node.js version, browser.

### Submitting Pull Requests

1. **Fork the Repository** (external contributors) or work directly on `inception` (maintainers).
2. **Clone and Install**: See [Development Setup](#development-setup).
3. **Make Changes**: Keep changes small and focused. Respect [Public API Stability](#public-api-stability).
4. **Write/Update Tests**: New behavior needs tests; changed behavior needs updated tests.
5. **Run Checks Locally**: Build, lint, and tests (see [Testing](#testing)).
6. **Add a Changeset**: Run `pnpm changeset` if your change affects the published package.
7. **Commit**: Follow [Git Guidelines](#git-guidelines). Husky hooks run lint-staged on commit, commitlint on the message, and a build on push.
8. **Open a Pull Request** targeting `main` (from `inception`) or `inception` (from a fork branch). Link related issues.

## Development Setup

Requirements:

- Node.js 20 or later
- pnpm 11 (the repo pins `pnpm@11.1.1` via the `packageManager` field)

```bash
git clone https://github.com/SELISEdigitalplatforms/blocks-genesis-react.git
cd blocks-genesis-react
pnpm install --frozen-lockfile
pnpm build
```

## Branching Strategy

- `main`: The default branch and the released state of the repository. Protected; changes land only through pull requests.
- `dev`: Integration branch used by the wider Blocks platform.
- `inception`: The active working branch. Day-to-day work is committed here, and pull requests are opened from `inception` into `main`. Pushes to `inception` also trigger the publish workflow.
- Contributors without write access: fork the repository and open a pull request against `inception`.

Never force-push or rewrite history on shared branches.

## Git Guidelines

- **Use the Imperative Mood**: Start commit messages with a verb in the imperative mood (e.g., "add", "fix", "update", "remove").
- **Keep Messages Short and Descriptive**: The subject line should be concise and clearly describe the change.
- **Lowercase Subject, No Trailing Period**.
- **Conventional Commits**: Use `type(scope): subject`. Commitlint enforces the scope: when you use one, it must be one of `ui`, `hooks`, `docs`, `tooling`, `release`, `deps`, `cli`, `chore`, `test` (see `commitlint.config.js`).
- **Reference Issues**: Reference related issues in the body (e.g., "fixes #123").

Example:

```
fix(ui): keep dialog focus trap active on nested popovers

- return focus to the trigger on close
- fixes #123
```

## Testing

Tests are Vitest with jsdom and Testing Library, colocated with the source in `packages/compose-react/src`. Run them from the repository root:

```bash
pnpm --filter @seliseblocks/blocks-kit test
```

or from the package directory:

```bash
cd packages/compose-react
pnpm test
```

Watch mode (`test:watch`) and coverage (`test:cov`) scripts are also defined in `packages/compose-react/package.json`.

Also run before pushing:

```bash
pnpm build
pnpm lint
pnpm typecheck
```

The pre-push hook runs `pnpm run build` automatically.

## Releasing

Releases are driven by [Changesets](https://github.com/changesets/changesets):

1. Include a changeset with your PR: `pnpm changeset` (choose the bump and describe the change).
2. Version bumps are applied with `pnpm version-packages`.
3. Publishing happens in CI (`.github/workflows/publish.yml`) on push to `inception`, via npm Trusted Publishing (OIDC). No npm tokens live in this repository.

## Repository Conventions

- Markdown policy: only `README.md` files and the root `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, and `CODE_OF_CONDUCT.md` are tracked. Other `*.md` files are gitignored, and CI (`repo-hygiene` workflow) rejects strays, as well as AI assistant artifacts (`.claude/`, `.cursor/`, `CLAUDE.md`, and similar).
- Formatting and linting are enforced by the shared configs in `tooling/` and run on staged files via lint-staged.

## Code Review Process

1. **PR Submission**: Keep PRs small and well-documented.
2. **Automated Checks**: CI runs the repo-hygiene workflow on PRs; run build, lint, typecheck, and tests locally.
3. **Peer Review**: At least one maintainer must approve the PR.
4. **Merge**: Once approved, the PR is merged into its target branch.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
