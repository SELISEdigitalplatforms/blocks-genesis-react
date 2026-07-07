# AI Agent Instructions for Blocks Kit

## IMPORTANT: Read This First

This file contains specific instructions for AI agents working on the `blocks-kit` repository. You MUST follow all conventions outlined here and in the [PROJECT_CONVENTIONS.md](../PROJECT_CONVENTIONS.md) file.

## Project Overview

- **Monorepo**: Uses Turborepo with PNPM
- **Main Package**: `@seliseblocks/blocks-kit` in `packages/compose-react/`
- **Tech Stack**: React 18+, TypeScript, Zod, Tailwind CSS, Radix UI, TanStack Query, Zustand
- **Node Version**: >= 20

## Core Conventions

### 1. File Structure & Naming

- **Components**: PascalCase (e.g., `Button.tsx`, `ProjectList.tsx`)
- **Hooks**: `use-` prefix, kebab-case (e.g., `use-project.ts`, `use-toast.tsx`)
- **Models**: PascalCase with `I` prefix for interfaces (e.g., `IProject`, `IUser`)
- **Services**: Class-based with singleton export (e.g., `ProjectService` → `projectService`)
- **Schemas**: Zod schemas with `.schema.ts` suffix

### 2. Domain Inputs (CRITICAL)

- **UI**: Always show static `https://` prefix in domain input fields
- **Underlying Value**: Never include protocol in stored/transmitted value
- **Auto-Population**: `cookieDomain` auto-populates from `domain` until user manually interacts with `cookieDomain` field

### 3. Form Synchronization

- **Preference**: Use event-driven logic or direct state updates over `useEffect` for form field synchronization when possible

### 4. Design System

- Use Blocks Design System tokens (see `packages/compose-react/design.md`)
- Use Radix UI primitives for accessible components
- Follow dark mode conventions

### 5. State Management

- TanStack Query for data fetching/caching
- Zustand for global state
- Query key factory pattern (see `use-query-client/`)

### 6. Validation

- Use Zod schemas for form validation
- Use `domainRegex` for consistent domain/cookieDomain validation

## When Creating New Files

1. **Check existing patterns**: Look at similar files in the codebase first
2. **Follow naming conventions**: Use the appropriate prefixes/suffixes
3. **Export properly**: Add exports to index files where applicable
4. **Use existing utilities**: Prefer existing hooks, services, and components over reinventing
5. **Test**: Ensure your changes integrate with existing code

## When Modifying Existing Files

1. **Maintain conventions**: Don't change existing patterns without good reason
2. **Update related files**: If you modify a model, check hooks/services that use it
3. **Test thoroughly**: Ensure your changes don't break existing functionality

## Key Files to Reference

- [PROJECT_CONVENTIONS.md](../PROJECT_CONVENTIONS.md): Comprehensive conventions guide
- [design.md](../packages/compose-react/design.md): Blocks Design System documentation
- [project.model.ts](../packages/compose-react/src/models/project.model.ts): Example model
- [project.service.ts](../packages/compose-react/src/services/project.service.ts): Example service
- [use-project.ts](../packages/compose-react/src/hooks/use-project.ts): Example hook
- [dialog.tsx](../packages/compose-react/src/components/common/project/set-custom-domain/dialog.tsx): Domain input example
