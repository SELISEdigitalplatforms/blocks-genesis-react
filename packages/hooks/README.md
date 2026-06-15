# @blocks-kit/hooks

Framework-agnostic React hooks for Blocks applications.

## Query Client Helpers

`@blocks-kit/hooks/query-client` provides factory-first helpers around TanStack
Query's `QueryClient`. Cache helpers accept keys created by
`createQueryKeyFactory`, which keeps query reads, writes, and invalidations
consistent across modules.

```ts
import { createQueryKeyFactory, useQueryClientKit } from "@blocks-kit/hooks/query-client";

export const identifierKeys = createQueryKeyFactory("identifier", (key) => ({
  projectsRoot: () => key("projects"),
  projects: (tenantGroupId: string) => key("projects", tenantGroupId),
  project: (options: { projectId: string }) => key("project", options),
}));

export function useUpdateProjectCache() {
  const cache = useQueryClientKit();

  return {
    invalidateProjects: () => cache.invalidate(identifierKeys.projectsRoot()),
    getProject: (projectId: string) => cache.getData(identifierKeys.project({ projectId })),
  };
}
```

For advanced TanStack Query APIs that are intentionally outside the blocks-kit
helper layer, use the explicit escape hatch:

```ts
const { client } = useQueryClientKit();
```
