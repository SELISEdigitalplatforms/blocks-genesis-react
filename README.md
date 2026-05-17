# Blocks UI

> A React 19 + shadcn/ui design-system monorepo for the Blocks platform.
> Built on **Tailwind CSS v4**, Radix primitives, and the **shadcn monorepo
> pattern** (https://ui.shadcn.com/docs/monorepo). Tokens, primitives, and
> custom Blocks components are extracted from the existing
> `blocks-app-next` Next.js application so any consumer (current or new)
> gets identical look + behaviour.

---

## Stack

| Concern      | Choice                                                                    |
| ------------ | ------------------------------------------------------------------------- |
| Framework    | React **19** (no Next.js — playground is Vite)                            |
| Components   | shadcn/ui (latest) + Radix UI                                             |
| Styling      | Tailwind CSS **v4** (`@import "tailwindcss"`, `@theme`), CSS variables    |
| Variants     | `class-variance-authority`                                                |
| Forms        | `react-hook-form` + `zod` + `@hookform/resolvers` (shadcn `form` pattern) |
| Animations   | `framer-motion` + `tailwindcss-animate`                                   |
| Typography   | `@tailwindcss/typography` plugin (`prose` utilities)                      |
| Toasts       | `sonner` (via shadcn `sonner` wrapper)                                    |
| Charts       | `recharts` via shadcn `chart` wrapper                                     |
| Icons        | `lucide-react`                                                            |
| Build        | Turborepo + pnpm workspaces                                               |
| Tests / Lint | `eslint` 9 (flat config), `typescript-eslint`, `prettier`                 |

---

## Repository layout

```
blocks-ui/
├── apps/
│   └── web/                    # Vite + React 19 playground / docs
│       ├── components.json
│       ├── src/{App.tsx, main.tsx, index.css}
│       ├── tsconfig*.json
│       └── vite.config.ts
├── packages/
│   ├── cli/                    # @blocks-kit/cli — `blocks` installer (init / add / remove / list / doctor)
│   │   ├── registry/           # generated registry.json (61 components)
│   │   └── src/commands/
│   ├── ui/                     # @blocks-kit/ui — shadcn primitives (source)
│   │   ├── components.json     # shadcn config (Tailwind v4: tailwind.config = "")
│   │   ├── postcss.config.js   # @tailwindcss/postcss
│   │   ├── src/
│   │   │   ├── components/     # 40+ shadcn primitives + Blocks extras
│   │   │   ├── hooks/          # use-mobile.tsx (extend as needed)
│   │   │   ├── lib/utils.ts    # `cn()`
│   │   │   └── styles/globals.css   # tokens + @theme bridge
│   │   └── package.json
│   ├── eslint-config/          # @blocks-kit/eslint-config (flat, react preset)
│   └── typescript-config/      # @blocks-kit/tsconfig (base / react-library / vite)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

The structure follows the official shadcn monorepo guide: each workspace has its
own `components.json`, the shared package exposes a `globals.css` export, and
`packages/ui` uses `package.json#imports` (`#components/*`, `#hooks/*`, `#lib/*`)
for local aliases plus the public `@blocks-kit/ui/*` `exports` for cross-workspace
imports.

---

## Quick start

Requires **Node ≥ 20** and **pnpm ≥ 9**.

```bash
cd blocks-kit
pnpm install

# Run the playground
pnpm --filter @blocks-kit/web dev          # → http://localhost:5173

# Build everything (apps + packages)
pnpm build

# Lint / typecheck the whole monorepo
pnpm lint
pnpm typecheck

# Build the CLI (registry + bundle)
pnpm cli:build
```

---

## Blocks CLI (`@blocks-kit/cli`)

The **Blocks CLI** installs `@blocks-kit/ui` into any **React 19** app (Vite or Next.js). It works like [shadcn/ui](https://ui.shadcn.com): pick components interactively, copy primitives into your repo, and install peer dependencies in one step.

### Prerequisites

| Requirement | Notes |
| ----------- | ----- |
| **Node** | ≥ 20 |
| **React** | 19+ (`react` in `dependencies`) |
| **Stack** | Vite + React or Next.js |
| **Tailwind** | v4 recommended (CLI patches your CSS entry on `init`) |

Scaffold a React app first (`package.json`, `tsconfig` with `@/*` paths). The CLI does not create a project from scratch.

### Install the CLI

**From this monorepo** (development):

```bash
cd blocks-ui
pnpm install
pnpm cli:build          # generates registry + dist/index.js

# Run from repo root
pnpm blocks --help
pnpm cli:dev init       # run via tsx without building
```

**In a consumer app** (when `@blocks-kit/cli` is published or linked):

```bash
pnpm add -D @blocks-kit/cli
# or: npx @blocks-kit/cli@latest
```

Binaries: `blocks` and `blocks-ui` (same entry).

### Recommended workflow

```bash
cd your-react-app

# 1. One-time setup: components.json, globals CSS, @blocks-kit/ui
blocks init

# 2. Add components (interactive multiselect, or by name)
blocks add
blocks add button card dialog
blocks add --all              # every registry item

# 3. List what is available
blocks list
blocks list --kind primitive
blocks list -q table

# 4. Remove copied primitives
blocks remove button card
blocks remove --all
blocks remove button --prune-deps   # also uninstall unused npm deps

# 5. Verify wiring
blocks doctor
```

Wrap your app with **next-themes** after `init` (snippet is printed at the end of `blocks init`):

```tsx
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### Primitives vs blocks

| Kind | On `add` | On disk after install | Import from |
| ---- | -------- | --------------------- | ----------- |
| **primitive** | Copies source into `@/components/ui/<name>/` | Yes | `@/components/ui/<name>` (or your `aliases.ui`) |
| **block** | Installs npm deps only | No — stays in package | `@blocks-kit/ui/components/<name>` |

**Blocks** (composed widgets): `data-table`, `kanban`, `multi-select`, `wizard-stepper`, `file-uploader`, etc.  
**Primitives** (shadcn-style): `button`, `dialog`, `form`, `table`, …

`blocks add` resolves **registry dependencies** automatically (e.g. `alert-dialog` pulls in `button`).

### Global flags

Every command accepts:

| Flag | Description |
| ---- | ----------- |
| `-c, --cwd <path>` | Project root (default: current directory) |
| `--dry-run` | Print actions without writing files or running package manager |
| `-y, --yes` | Non-interactive defaults (skip prompts) |

Environment: `BLOCKS_CLI_YES=1` behaves like `-y`.  
`BLOCKS_UI_VERSION_OVERRIDE` pins the `@blocks-kit/ui` version range used on install.

### Commands reference

#### `blocks init`

Writes `components.json`, adds `@import "@blocks-kit/ui/globals.css"` to your CSS entry, installs `@blocks-kit/ui`.

```bash
blocks init
blocks init -y --template vite --theme slate --default-mode system --pm pnpm
blocks init --dry-run
```

| Option | Description |
| ------ | ----------- |
| `-t, --template <vite\|next>` | Framework |
| `--theme <color>` | Tailwind `baseColor`: `slate`, `zinc`, `neutral`, `stone`, `gray` |
| `--default-mode <light\|dark\|system>` | Default theme for `next-themes` |
| `--pm <pnpm\|npm\|yarn>` | Package manager |

#### `blocks add`

```bash
blocks add                      # interactive search + multiselect (★ Select all)
blocks add button input form
blocks add data-table kanban    # blocks: deps only
blocks add --all
blocks add button --overwrite   # replace existing primitive files
blocks add -y button --dry-run
```

| Option | Description |
| ------ | ----------- |
| `--all` | Install every registry item |
| `--overwrite` | Overwrite existing primitive files |
| `--pm <pnpm\|npm\|yarn>` | Package manager for dependency install |

#### `blocks remove`

Removes **copied primitives** under `aliases.ui` (default `@/components/ui/<name>/`).  
**Blocks** have no on-disk files — the CLI reminds you to drop imports from your app.

```bash
blocks remove                   # interactive: only shows primitives already on disk
blocks remove button card
blocks remove --all             # remove every copied primitive folder
blocks remove button --prune-deps   # uninstall npm packages only used by removed components
blocks remove button --dry-run
```

| Option | Description |
| ------ | ----------- |
| `--all` | Remove all copied primitives under `aliases.ui` |
| `--prune-deps` | Run `pnpm remove` / `npm uninstall` for deps no longer needed |
| `--pm <pnpm\|npm\|yarn>` | Package manager (with `--prune-deps`) |

`@blocks-kit/ui`, `react`, and `react-dom` are never pruned.

#### `blocks list`

```bash
blocks list
blocks list --kind primitive
blocks list --kind block
blocks list -q fuse
```

#### `blocks doctor`

Checks React 19, `@blocks-kit/ui`, `components.json`, `aliases.ui` directory, globals CSS import, and `blocks.defaultMode`.

```bash
blocks doctor
blocks doctor -c ./apps/web
```

### Using installed components

**Primitives** (copied locally):

```tsx
import { Button } from "@/components/ui/button"
```

**Blocks** (package import):

```tsx
import { BlocksDataTable } from "@blocks-kit/ui/components/data-table"
```

**Utils** (from package, configured in `components.json`):

```tsx
import { cn } from "@blocks-kit/ui/lib/utils"
```

### Develop the CLI in this repo

```bash
cd packages/cli
pnpm build              # build:registry + tsup + copy registry → dist/
pnpm typecheck
pnpm lint
pnpm test:smoke         # dry-run init/add/remove against apps/web copy
```

Regenerate the registry after changing `packages/ui/src/components`:

```bash
pnpm --filter @blocks-kit/cli build:registry
```

---

## Adding components (shadcn CLI — monorepo maintainers)

The shadcn CLI is monorepo-aware. From any app workspace it figures out that
primitives belong in `packages/ui` and hooks/lib too. Run from `apps/web`:

```bash
cd apps/web
pnpm dlx shadcn@latest add <component>
```

Or, more conveniently, from the repo root:

```bash
pnpm --filter @blocks-kit/web exec shadcn@latest add <component>
```

Examples:

```bash
pnpm --filter @blocks-kit/web exec shadcn@latest add accordion alert dialog form
pnpm --filter @blocks-kit/web exec shadcn@latest add login-01            # blocks
```

Files land in `packages/ui/src/components/<name>.tsx`. Composition blocks
(login forms, dashboards, etc.) land in `apps/web/src/components/`.

---

## Importing in apps

```tsx
import { Button } from "@blocks-kit/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@blocks-kit/ui/components/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@blocks-kit/ui/components/form";
import { useIsMobile } from "@blocks-kit/hooks";
import { cn } from "@blocks-kit/ui/lib/utils";
```

In your app's CSS entry, import the shared token + base layer:

```css
/* src/index.css */
@import "@blocks-kit/ui/globals.css";
```

Vite picks this up automatically through the `exports` field on `@blocks-kit/ui`.

---

## Theming

All tokens live in
[`packages/ui/src/styles/globals.css`](./packages/ui/src/styles/globals.css). The
file declares two layers:

1. **CSS custom properties** under `:root` and `.dark` — HSL channels (e.g.
   `--primary: 218 78% 32%`) so they compose with Tailwind opacity utilities
   (`bg-primary/80`).
2. **Tailwind v4 bridge** — `@theme inline { --color-primary: hsl(var(--primary)) … }`
   exposing the tokens as utility-aware design tokens (`bg-primary`,
   `text-foreground`, `border-blocks-primary-500`, …).

To toggle dark mode, add the `dark` class to `<html>`:

```ts
document.documentElement.classList.toggle("dark");
```

The custom variant `@custom-variant dark (&:where(.dark, .dark *));` is declared
in `globals.css`, so all `dark:` utilities work out of the box.

### Token groups (extracted from the existing Blocks app)

- shadcn semantic: `background`, `foreground`, `card`, `popover`, `primary`,
  `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`
- Blocks emphasis: `high-emphasis`, `medium-emphasis`, `low-emphasis`,
  `border-default`, `border-medium-emphasis`
- Brand primary (blue): `blocks-primary-{25,50,100,…,900}` +
  `blocks-primary-shades-{100,200,300}`
- Brand secondary (teal): `blocks-secondary-{50,100,…,900}`
- Status: `success`, `error`, `warning-{50…900}`, `base-warning`, `icon-warning`
- Charts: `chart-{purple,purple-light,magenta,yellow,red,blue,orange,brown-gray}`
  - shadcn aliases `chart-1` … `chart-5`
- Surfaces & neutrals: `surface-app`, `neutral-{50,200,300}`
- Decorative hex (kept as raw values): `blocks-error-{50,100,800}`,
  `avatar-surface-default`, `avatar-text-high-emphasis`, `base-error`,
  `--loader-color`
- Sidebar: full shadcn sidebar token set

---

## Component inventory

All shadcn primitives shipped via `pnpm dlx shadcn@latest add ...`:

> accordion · alert · alert-dialog · aspect-ratio · avatar · badge · breadcrumb ·
> button · calendar · card · carousel · chart · checkbox · collapsible · command ·
> context-menu · dialog · drawer · dropdown-menu · form · hover-card · input ·
> input-otp · label · menubar · navigation-menu · pagination · popover · progress ·
> radio-group · resizable · scroll-area · select · separator · sheet · sidebar ·
> skeleton · slider · sonner · switch · table · tabs · textarea · toggle ·
> toggle-group · tooltip

**Blocks-specific extensions** (live in `packages/ui/src/components/`):

| File                   | Notes                                                                         |
| ---------------------- | ----------------------------------------------------------------------------- |
| `button.tsx`           | adds `destructive-outline` variant + `xs` / `xxs` sizes; default `rounded-sm` |
| `password-input.tsx`   | `Input` with show/hide eye toggle                                             |
| `spinner.tsx`          | `Loader2` styled with `--loader-color`, sizes sm/md/lg                        |
| `stepper.tsx`          | horizontal + vertical step list, animated with `framer-motion`                |
| `table-pagination.tsx` | composition: `Pagination` controls + page-size `Select`                       |

### Forms (RHF + Zod)

The shadcn `form` component is included. Standard usage:

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@blocks-kit/ui/components/button";
import { Input } from "@blocks-kit/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@blocks-kit/ui/components/form";

const schema = z.object({ email: z.string().email() });

export function SignInForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Sign in</Button>
      </form>
    </Form>
  );
}
```

---

## Using `@blocks-kit/ui` in another app (e.g. `blocks-app-next`)

1. **Install the Blocks CLI** in the app (or run via `npx`):

   ```bash
   pnpm add -D @blocks-kit/cli
   blocks init
   blocks add button card data-table
   ```

2. **Or workspace-link** `@blocks-kit/ui` while iterating in a monorepo:

   ```jsonc
   // app's package.json
   {
     "dependencies": { "@blocks-kit/ui": "workspace:*" },
     "devDependencies": { "@blocks-kit/cli": "workspace:*" }
   }
   ```

3. **Tailwind v4** in the consuming app:

   ```bash
   pnpm add tailwindcss @tailwindcss/postcss        # or @tailwindcss/vite
   ```

4. **CSS entry** (usually done by `blocks init`):

   ```css
   /* src/index.css */
   @import "@blocks-kit/ui/globals.css";
   ```

5. **Use components** — primitives from `@/components/ui/*` after `blocks add`, blocks from `@blocks-kit/ui/components/*`.

6. **Remove** when no longer needed:

   ```bash
   blocks remove button --prune-deps
   ```

7. **Add new primitives to the design system** (maintainers): shadcn CLI from `apps/web`, then rebuild the Blocks registry:

   ```bash
   pnpm --filter @blocks-kit/web exec shadcn@latest add card
   pnpm --filter @blocks-kit/cli build:registry
   ```

---

## Scripts

| Command                                                | Effect                               |
| ------------------------------------------------------ | ------------------------------------ |
| `pnpm dev`                                             | turbo dev (runs `apps/web`)          |
| `pnpm build`                                           | turbo build (apps + packages)        |
| `pnpm lint`                                            | ESLint across all workspaces         |
| `pnpm typecheck`                                       | `tsc --noEmit` across all workspaces |
| `pnpm format`                                          | Prettier (Tailwind plugin enabled)   |
| `pnpm cli:build`                                       | Build `@blocks-kit/cli` (registry + dist) |
| `pnpm blocks -- <cmd>`                                 | Run `blocks` CLI from monorepo root  |
| `pnpm cli:dev -- <cmd>`                                | Run CLI via `tsx` (no build)         |
| `pnpm --filter @blocks-kit/cli test:smoke`                 | CLI integration smoke (dry-run)      |
| `pnpm --filter @blocks-kit/web exec shadcn@latest add <c>` | Add shadcn primitive to `@blocks-kit/ui` |

---

## Conventions

- **Tokens are the public theming API.** Components reference tokens
  (`bg-primary`, `text-foreground`, `border-blocks-primary-500`), never raw
  hex. Re-skinning an app means overriding CSS variables in `:root` / `.dark`.
- **No SCSS.** Pure CSS + Tailwind v4 only.
- **One component per file** under `packages/ui/src/components/<name>.tsx`,
  matching the shadcn registry layout exactly so the CLI can keep updating
  files in place.
- **Hooks** that are app-agnostic (mobile detection, debounce, copy-to-clipboard,
  countdowns, popover-width) live in `packages/ui/src/hooks/`. App-specific
  hooks (auth, routing, i18n, filters) stay in their consuming app.
- **`cn()` is the only blessed class merger.** Never compose strings ad-hoc.

---

## Reference

- shadcn monorepo guide: https://ui.shadcn.com/docs/monorepo
- shadcn Vite installation: https://ui.shadcn.com/docs/installation/vite
- Tailwind CSS v4: https://tailwindcss.com/docs
- Radix UI: https://www.radix-ui.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
