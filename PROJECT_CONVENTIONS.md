# Blocks Kit Project Conventions

This document outlines all conventions, patterns, and rules for working on the `blocks-kit` repository. All developers and AI agents MUST follow these guidelines.

---

## Table of Contents

1. [Monorepo Structure](#monorepo-structure)
2. [Tech Stack](#tech-stack)
3. [File Naming & Organization](#file-naming--organization)
4. [TypeScript Conventions](#typescript-conventions)
5. [Component Patterns](#component-patterns)
6. [Hook Patterns](#hook-patterns)
7. [Service Patterns](#service-patterns)
8. [Model Patterns](#model-patterns)
9. [State Management](#state-management)
10. [Form Handling & Validation](#form-handling--validation)
11. [Design System](#design-system)
12. [Domain Input Rules (CRITICAL)](#domain-input-rules-critical)
13. [Testing](#testing)
14. [Git & Versioning](#git--versioning)

---

## Monorepo Structure

```
blocks-kit/
├── packages/
│   └── compose-react/          # Main package: @seliseblocks/blocks-kit
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom hooks
│       │   ├── services/       # API services
│       │   ├── models/         # TypeScript interfaces/types
│       │   ├── store/          # Zustand stores
│       │   ├── lib/            # Utilities & helpers
│       │   ├── contexts/       # React contexts
│       │   ├── layouts/        # Layout components
│       │   ├── pages/          # Page components
│       │   ├── constants/      # Constants
│       │   └── guards/         # Route guards
│       ├── design.md           # Design system documentation
│       └── package.json
├── .changeset/                 # Changesets for versioning
├── .husky/                     # Git hooks
└── package.json                # Root monorepo config
```

---

## Tech Stack

- **Framework**: React 18+
- **Language**: TypeScript 5+
- **Package Manager**: PNPM
- **Monorepo**: Turborepo
- **Styling**: Tailwind CSS + Blocks Design System tokens
- **UI Primitives**: Radix UI
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **Validation**: Zod
- **Git Hooks**: Husky + lint-staged
- **Versioning**: Changesets

---

## File Naming & Organization

### Components

- **Naming**: PascalCase (e.g., `Button.tsx`, `ProjectList.tsx`)
- **Location**: `src/components/`
- **Structure**:
  ```
  components/
  ├── common/           # Reusable across app
  │   ├── project/
  │   │   ├── set-custom-domain/
  │   │   │   ├── dialog.tsx
  │   │   │   └── index.ts
  │   │   └── index.ts
  │   └── index.ts
  └── core/             # Design system components
      ├── button/
      │   ├── button.tsx
      │   └── index.ts
      └── index.ts
  ```
- **Index Exports**: Always export from `index.ts`

### Hooks

- **Naming**: Kebab-case with `use-` prefix (e.g., `use-project.ts`, `use-toast.tsx`)
- **Location**: `src/hooks/`
- **Structure**: Group related hooks in directories
- **Example**: `src/hooks/use-project.ts`

### Services

- **Naming**: PascalCase with `Service` suffix (e.g., `ProjectService`)
- **Location**: `src/services/`
- **Pattern**: Class-based with singleton export
- **Example**:

  ```typescript
  export class ProjectService {
    // methods
  }

  export const projectService = new ProjectService();
  ```

### Models

- **Naming**: PascalCase with `I` prefix for interfaces (e.g., `IProject`, `IUser`)
- **Location**: `src/models/`
- **Example**: `src/models/project.model.ts`

### Schemas

- **Naming**: Kebab-case with `.schema.ts` suffix (e.g., `edit-project-form.schema.ts`)
- **Location**: Co-located with the component that uses it

### Constants

- **Naming**: UPPER_SNAKE_CASE
- **Location**: `src/constants/`

---

## TypeScript Conventions

### Interfaces

- Prefix with `I` (e.g., `IProject`, `IUser`)
- Use for object shapes and component props

### Types

- Use `type` for unions, intersections, and utility types
- Don't prefix with `I`

### Generics

- Use descriptive names (e.g., `TData`, `TError`) instead of single letters

---

## Component Patterns

### Basic Component Structure

```tsx
import { FC } from "react";

interface IButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export const Button: FC<IButtonProps> = ({ children, variant = "primary" }) => {
  return <button className={/* ... */}>{children}</button>;
};
```

### Component Exports

- Export named components (avoid default exports)
- Export from `index.ts` files

---

## Hook Patterns

### Custom Hooks

- Start with `use`
- Return an object or array as appropriate
- Co-locate related hooks
- Use TanStack Query for data fetching

### Example: Query Hook

```typescript
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";

export const useGetProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.getProjects(),
  });
};
```

### Query Key Factory

Use `query-key-factory.ts` for consistent query keys:

```typescript
export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
};
```

---

## Service Patterns

### Service Class Structure

```typescript
import { HttpClient } from "../lib/http";

export class ProjectService {
  private readonly httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  async getProjects() {
    return this.httpClient.get("/projects");
  }

  async updateProject(id: string, data: unknown) {
    return this.httpClient.put(`/projects/${id}`, data);
  }
}

export const projectService = new ProjectService();
```

### HTTP Client

Use `HttpClient` from `src/lib/http/` for all API calls

---

## Model Patterns

### Interface Definitions

```typescript
export interface IProject {
  id: string;
  name: string;
  domain: string;
  cookieDomain?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Export from Index

Always export models from `src/models/index.ts`

---

## State Management

### TanStack Query

- Use for server state
- Prefetch when appropriate
- Invalidate queries on mutations

### Zustand

- Use for client-side global state
- Keep stores focused and small

---

## Form Handling & Validation

### Zod Schemas

Define schemas in `.schema.ts` files:

```typescript
import { z } from "zod";
import { domainRegex } from "../constants";

export const editProjectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().regex(domainRegex, "Invalid domain"),
  cookieDomain: z.string().regex(domainRegex, "Invalid domain").optional(),
});
```

### Form Field Synchronization

- **Preference**: Use event-driven logic or direct state updates over `useEffect` when possible
- Example: Update `cookieDomain` when `domain` changes, until user touches `cookieDomain`

---

## Design System

### Blocks Design System

- Refer to `packages/compose-react/design.md` for complete documentation
- Use design tokens instead of hardcoded values
- Follow accessibility guidelines
- Support dark mode

### Radix UI

- Use Radix UI primitives for accessible components
- Style with Tailwind CSS

---

## Domain Input Rules (CRITICAL)

### UI Presentation

- Always show a static `https://` prefix in domain input fields
- The prefix should be visual only, not part of the editable value

### Underlying Value

- Never include the protocol (`http://` or `https://`) in the stored/transmitted value
- Store only the domain part (e.g., `example.com`, not `https://example.com`)

### cookieDomain Auto-Population

- Auto-populate `cookieDomain` from `domain` field value
- Stop auto-populating once the user manually interacts with (touches) the `cookieDomain` field
- Example implementation in [dialog.tsx](packages/compose-react/src/components/common/project/set-custom-domain/dialog.tsx)

### Domain Validation

- Use `domainRegex` from constants for consistent validation across `domain` and `cookieDomain` fields

---

## Testing

### Test Files

- Co-locate test files with source files
- Use `.test.ts` or `.test.tsx` suffix

---

## Git & Versioning

### Commits

- Use Conventional Commits
- Husky pre-commit hooks run linting and formatting

### Versioning

- Use Changesets for version management
- Create a changeset when making changes that need to be published

---

## References

- [.trae/agent-instructions.md](.trae/agent-instructions.md) - Quick reference for AI agents
- [design.md](packages/compose-react/design.md) - Blocks Design System
- [package.json](package.json) - Root monorepo config
- [packages/compose-react/package.json](packages/compose-react/package.json) - Compose React package config
