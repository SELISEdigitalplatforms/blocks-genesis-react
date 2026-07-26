# @seliseblocks/blocks-kit

React app-shell composition package for SELISE Blocks applications: guards, layouts, providers, pages, stores, hooks, an HTTP client, and a shadcn/Radix based component library. It is the shared frontend foundation consumed by the Blocks service applications (IAM, OS, Data, Logic, Monitor, Release, Studio, Utilities, Localization).

Ships as ESM and CJS with bundled TypeScript declarations. Every module carries a `"use client"` banner, and `sideEffects` is `false`, so bundlers can tree-shake unused exports.

## Installation

```bash
npm install @seliseblocks/blocks-kit
# or
yarn add @seliseblocks/blocks-kit
# or
pnpm add @seliseblocks/blocks-kit
```

## Peer Dependencies

Your application must provide these packages (`@types/react` is optional, for TypeScript users):

```json
{
  "@tanstack/react-query": "^5.0.0",
  "nuqs": "^2.0.0",
  "react": "^18.3.1 || ^19.0.0",
  "react-dom": "^18.3.1 || ^19.0.0",
  "react-router-dom": "^6.0.0",
  "zustand": "^5.0.0"
}
```

## Styling Contract

This package intentionally ships **no CSS files**. Host applications are responsible for:

- Tailwind CSS setup, including scanning this package's dist output so its utility classes are generated:

  ```ts
  // tailwind.config.ts
  export default {
    content: [
      "./app/**/*.{ts,tsx}",
      "./node_modules/@seliseblocks/blocks-kit/dist/**/*.{js,jsx,ts,tsx}",
    ],
  };
  ```

- Tailwind CSS setup
- shared design tokens (CSS variables) for theming
- Any global CSS imports required by their design system

## Runtime Configuration

Service base URLs and keys are read at runtime, not baked in at build time. Provide them on `window.__BLOCKS_ENV__` before the app boots (typically an inline script in `index.html`), or through `import.meta.env`:

```html
<script>
  window.__BLOCKS_ENV__ = {
    BLOCKS_IAM_BASE_URL: "https://iam.example.com",
    BLOCKS_LOGIC_BASE_URL: "https://logic.example.com",
    BLOCKS_X_BLOCKS_KEY: "your-blocks-key",
  };
</script>
```

Read values with `getRuntimeEnv` from `@seliseblocks/blocks-kit/lib`. The full key list is the `RuntimeKey` union exported from `@seliseblocks/blocks-kit/types` (per-service `*_BASE_URL`, `*_CLIENT_ID`, and `*_CALLBACK_URL` keys plus `BLOCKS_X_BLOCKS_KEY` and others).

## Quick Start

Wrap your app in the providers, then compose routes from the guards, layouts, and pages:

```tsx
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";

import {
  AuthResolver,
  ProtectedGuard,
  PublicGuard,
} from "@seliseblocks/blocks-kit/guards";
import { ConsoleLayout } from "@seliseblocks/blocks-kit/layouts";
import {
  CallbackPage,
  ConsolePage,
  LoginPage,
  ProfilePage,
} from "@seliseblocks/blocks-kit/pages";
import {
  BlocksAppLayout,
  QueryProvider,
  ThemeProvider,
} from "@seliseblocks/blocks-kit/providers";

const router = createBrowserRouter([
  {
    path: "/login/callback",
    element: <CallbackPage defaultRedirectUrl="/app/console" />,
  },
  {
    element: (
      <AuthResolver>
        <Outlet />
      </AuthResolver>
    ),
    children: [
      {
        element: (
          <PublicGuard>
            <Outlet />
          </PublicGuard>
        ),
        children: [{ path: "/login", element: <LoginPage /> }],
      },
      {
        path: "/app",
        element: (
          <ProtectedGuard>
            <ConsoleLayout>
              <Outlet />
            </ConsoleLayout>
          </ProtectedGuard>
        ),
        children: [
          { index: true, element: <Navigate to="console" replace /> },
          { path: "console", element: <ConsolePage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <NuqsAdapter>
          <BlocksAppLayout
            config={{
              name: "blocks-monitor",
              appLogoUrl: { dark: "/logo-dark.svg", light: "/logo-light.svg" },
            }}>
            <RouterProvider router={router} />
          </BlocksAppLayout>
        </NuqsAdapter>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>,
);
```

`BlocksAppLayout` takes a `config` with the service `name` (one of the `ServiceName` union values, for example `"blocks-os"` or `"blocks-monitor"`) and an `appLogoUrl` (a string, or `{ dark, light }` variants).

## Package Exports

The main entry (`@seliseblocks/blocks-kit`) re-exports everything below. Subpath imports keep intent clearer and are what the Blocks applications use.

| Subpath        | Contents                                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `./guards`     | `AuthResolver`, `ProtectedGuard`, `PublicGuard`, `ImpersonationChecker`, `ImpersonationSynchronizer`, `ImpersonationTerminator`                                                                                                                          |
| `./layouts`    | `AuthLayout`, `ConsoleLayout`, `DashboardLayout`, `DashboardRoute`, `OidcLayout`, `PublicLayout`, `useOidcContext`                                                                                                                                       |
| `./providers`  | `BlocksAppLayout`, `QueryProvider`, `ThemeProvider`, `DashboardLayoutProvider`, `getQueryClient`                                                                                                                                                         |
| `./pages`      | `CallbackPage`, `ConsolePage`, `DashboardOverview`, `LoginPage`, `ProfilePage`                                                                                                                                                                           |
| `./store`      | `useAuthStore`, `useAppSettingsStore`, `useImpersonateStore`, `useLanguageViewStore`, `useProjectStore`, `useUserStore`, `CreateAppConfigStore`                                                                                                          |
| `./hooks`      | See [Hooks](#hooks) below                                                                                                                                                                                                                                |
| `./components` | See [Components](#components) below                                                                                                                                                                                                                      |
| `./lib`        | See [HTTP Client and Lib](#http-client-and-lib) below                                                                                                                                                                                                    |
| `./utils`      | General-purpose helpers, see [Utils](#utils) below                                                                                                                                                                                                       |
| `./models`     | Domain models: `AuthStateShape`, `AuthTokenPair`, `BaseUser`, `UserDetails`, `IProject`, `IProjectGroup`, `IDomain`, `IEnvRepository`, `INotification`, `IMyOrganization`, `ImpersonationState`, `RegisteredService`, and related payload/response types |
| `./types`      | Shared types: `ApiResponse`, `ApiError`, `ApiErrorResponse`, `ApiPaginatedResponse`, `BaseRequestParams`, `Menu`, `NavigationMenuItem`, `NavigationNode`, `RuntimeKey`, `ProjectKey`, `Id`                                                               |

### Components

`@seliseblocks/blocks-kit/components` bundles two groups:

- **Core components** (Radix UI + shadcn based): `Accordion`, `Alert`, `AlertDialog`, `AspectRatio`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Calendar`, `Card`, `Carousel`, `ChartContainer`, `Checkbox`, `Collapsible`, `Command`, `ContextMenu`, `CopyToClipboardButton`, `DateRangePicker`, `Dialog`, `Drawer`, `DropdownMenu`, `FileUploader`, `Form`, `HoverCard`, `InfiniteScroller`, `Input`, `InputOTP`, `KanbanBoard`, `Label`, `MaskedText`, `Menubar`, `MultiSelect`, `NavigationMenu`, `Pagination`, `PasswordInput`, `Popover`, `Progress`, `RadioGroup`, `RenderConditionally`, `RenderAlternatively`, `ResizablePanel`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Spinner`, `Stepper`, `Switch`, `Table`, `TablePagination`, `Tabs`, `Textarea`, `Timeline`, `Toast`, `Toaster`, `Toggle`, `ToggleGroup`, `Tooltip`, and the `WizardStepper` family, along with their subcomponents (`CardContent`, `DialogTrigger`, `SelectItem`, and so on).

<<<<<<< HEAD

- # **Common composites**: `AppSwitcher`, `ArchiveProject`, `BackToConsoleNavigator`, `ConfirmationModal`, `ConsoleHeader`, `CopyableSnippet`, `DashboardHeader`, `DashboardSectionCard`, `DataTable`, `EnvironmentCard`, `EnvironmentList`, `ErrorBoundary`, `ErrorDisplay`, `FilterToolbar`, `LanguageSelector`, `LoadingButton`, `Logo`, `Notification`, `ProjectList`, `ProjectDetail`, `ProjectActions`, `ThemeSwitcher`, `UserDropdownMenu`, and more.

  All UI components organized into:

- **Core Components** (Radix UI based):
  - `Accordion`, `Alert`, `AlertDialog`, `AspectRatio`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Command`, `ContextMenu`, `CopyToClipboardButton`, `DateRangePicker`, `Dialog`, `Drawer`, `DropdownMenu`, `FileUploader`, `Form`, `HoverCard`, `ImportFileModal`, `InfiniteScroller`, `Input`, `InputOTP`, `KanbanBoard`, `Label`, `MaskedText`, `Menubar`, `MultiSelect`, `NavigationMenu`, `Pagination`, `PasswordInput`, `Popover`, `Progress`, `RadioGroup`, `RenderConditionally`, `RenderAlternatively`, `Resizable`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Spinner`, `Stepper`, `Switch`, `Table`, `TablePagination`, `Tabs`, `Textarea`, `Timeline`, `Toast`, `Toaster`, `Toggle`, `ToggleGroup`, `Tooltip`, `WizardStepper`

- **Common Components**:
  - `AppSwitcher`, `ArchiveProject`, `BackToConsoleNavigator`, `ConfirmationModal`, `ConsoleHeader`, `CopyableSnippet`, `DashboardHeader`, `DashboardSectionCard`, `EnvironmentCard`, `EnvironmentList`, `EnvironmentSelected`, `ErrorBoundary`, `ErrorDisplay`, `LanguageSelector`, `LoaderSpinner`, `LoadingButton`, `LoginHeader`, `Logo`, `LogoutButton`, `ModeToggle`, `Notification`, `NotificationBell`, `NotificationHeader`, `NotificationItem`, `NotificationList`, `ProjectList`, `ProjectDetail`, `ProjectEdit`, `ProjectActions`, `SidebarMenu`, `ThemeSwitcher`, `UserDropdownMenu`, and more

#### `@selisedigitalplatforms/blocks-kit/hooks`

> > > > > > > main

```tsx
import { Button, Card, CardContent } from "@seliseblocks/blocks-kit/components";

function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Button variant="default">Click Me</Button>
      </CardContent>
    </Card>
  );
}
```

### Hooks

State and UI helpers: `useBoolean`, `useCopyToClipboard`, `useCountDown`, `useDebounce`, `useMediaQuery`, `useIsMobile`, `usePathSegments`, `usePopoverWidth`, `useTheme`, `useToast`, `useIcon`, `useLogo`, `useScopedPath`, `useBlocksAppConfigStore`.

Search: `useFuseIndex`, `useFuseSearch`, `useDebouncedFuseFilter`.

Query helpers: `useQueryClientKit`, `useQueryStatesKit`, `createQueryKeyFactory`.

Domain data (TanStack Query backed): `useGetProject`, `useGetProjects`, `useUpdateProject`, `useDisableProject`, `useGetEnvRepositories`, `useGetAllServices`, `useGetMyOrganizations`, `useGetNotifications`, `useMarkAsRead`, `useMarkAllAsRead`, `useStartImpersonation`, `useStopImpersonation`, `useImpersonationStatusChecker`, `useInitiateRedirect`, `usePrefetchRedirect`, `useLanguage`, `useLanguageSwitcher`, `useLogout`, `useFilteredMenus`, `useIsActiveMenu`.

```tsx
import { useBoolean, useToast } from "@seliseblocks/blocks-kit/hooks";

function MyComponent() {
  const { toast } = useToast();
  const { value: isOpen, toggle } = useBoolean(false);

  return (
    <button
      onClick={() => {
        toggle();
        toast({ title: isOpen ? "Closed" : "Opened" });
      }}>
      Toggle
    </button>
  );
}
```

### HTTP Client and Lib

`@seliseblocks/blocks-kit/lib` exports:

- `HttpClient` and `HttpError`: a fetch-based client with Blocks key headers, token refresh queueing, and auth-failure redirects
- Preconfigured instances wired to the runtime env: `iamClient`, `logicClient`, `notificationClient`
- `getRuntimeEnv`, `createRuntimeEnvGetter`, `resolveBaseUrl`, `resolveEnv`
- `CookieStorage`, `cn`, theme helpers (`applyTheme`, `getSystemTheme`), and motion presets (`fadeInUp`, `fadeInScale`, `fadeTransition`, `motionEase`, `staggerContainer`, `staggerItem`)

```tsx
import {
  getRuntimeEnv,
  HttpClient,
  logicClient,
} from "@seliseblocks/blocks-kit/lib";

// Use a preconfigured instance:
async function fetchProjects() {
  return logicClient.get("/api/Project/Gets?page=0&pageSize=100");
}

// Or configure your own:
const client = new HttpClient({
  baseURL: () => getRuntimeEnv("BLOCKS_LOGIC_BASE_URL"),
  blocksKey: () => getRuntimeEnv("BLOCKS_X_BLOCKS_KEY"),
});
```

### Utils

`@seliseblocks/blocks-kit/utils` covers formatting (`formatDate`, `formatFullDate`, `formatNumber`, `formatCurrency`, `formatBytes`, `formatFileSize`, `formatDuration`), objects and arrays (`pick`, `omit`, `deepClone`, `deepEqual`, `deepMerge`, `groupBy`, `uniqueBy`), functions (`debounce`, `throttle`, `memoize`, `sleep`), validation (`isEmail`, `isUrl`, `isUuid`, `isPhone`, `isValidDomain`, `isValidSubdomain`), query strings (`parseQueryString`, `stringifyQueryString`), ids (`generateId`, `getUniqueID`), storage (`createStorage`, `createCookieStore`), error handling (`getErrorMessage`, `handleErrorMessages`, `hasErrorCode`), and toast helpers (`showSuccessToast`, `showErrorToast`, `showInfoToast`).

## Versioning and Compatibility

- The package is on a `0.0.x` release line and is versioned and published with [Changesets](https://github.com/changesets/changesets). While the major version is 0, any release may contain breaking changes; pin or use a caret range consciously.
- This package is consumed by ten downstream Blocks service repositories. Its exported names, signatures, types, and defaults are treated as a public API; changes to them are coordinated across all consumers. See [CONTRIBUTING](https://github.com/SELISEdigitalplatforms/blocks-genesis-react/blob/main/CONTRIBUTING.md) in the repository.

## Changelog

Release notes are generated by Changesets into `CHANGELOG.md`, which is included in the published npm package.

## License

MIT (c) SELISE Blocks
