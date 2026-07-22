# @seliseblocks/blocks-kit

A comprehensive React app-shell composition package with reusable components, hooks, layouts, and utilities for building blocks applications.

## Installation

```bash
npm install @seliseblocks/blocks-kit
# or
yarn add @seliseblocks/blocks-kit
# or
pnpm add @seliseblocks/blocks-kit
```

## Peer Dependencies

This package requires the following peer dependencies:

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

This package intentionally does **not** ship CSS files. Host applications are responsible for:

- Tailwind CSS setup
- shadcn token/theme variables
- Any global CSS imports required by their design system

## Quick Start

```tsx
import { BlocksAppLayout, AuthGuard, useToast, Button } from "@seliseblocks/blocks-kit";

function App() {
  return (
    <BlocksAppLayout>
      <AuthGuard>
        <YourApp />
      </AuthGuard>
    </BlocksAppLayout>
  );
}
```

## Package Exports

### Main Entry Point (`@seliseblocks/blocks-kit`)

Everything exported from the main entry:

| Category       | Exports                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Guards**     | `AuthGuard`, `ImpersonationGuard`, `ProtectedGuard`, `PublicGuard`                                                         |
| **Layouts**    | `AuthLayout`, `BlocksAppLayout`, `ConsoleLayout`, `DashboardLayout`, `OidcLayout`, `ProjectOverviewLayout`, `PublicLayout` |
| **Providers**  | (Check `./providers` subpath export)                                                                                       |
| **Store**      | (Check `./store` subpath export)                                                                                           |
| **Pages**      | `CallbackPage`, `ConsolePage`, `DashboardOverviewPage`                                                                     |
| **Lib**        | `HttpClient`, `cookieStorage`, `motionPresets`, `runtimeEnv`                                                               |
| **Components** | (Check `./components` subpath export)                                                                                      |
| **Hooks**      | (Check `./hooks` subpath export for full list, or import directly from main entry)                                         |
| **Utils**      | (Check `./utils` subpath export)                                                                                           |
| **Models**     | (Check `./models` subpath export)                                                                                          |

### Subpath Exports

#### `@seliseblocks/blocks-kit/components`

All UI components organized into:

- **Core Components** (Radix UI + shadcn based):
  - `Accordion`, `Alert`, `AlertDialog`, `AspectRatio`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Command`, `ContextMenu`, `CopyToClipboardButton`, `DateRangePicker`, `Dialog`, `Drawer`, `DropdownMenu`, `FileUploader`, `Form`, `HoverCard`, `ImportFileModal`, `InfiniteScroller`, `Input`, `InputOTP`, `KanbanBoard`, `Label`, `MaskedText`, `Menubar`, `MultiSelect`, `NavigationMenu`, `Pagination`, `PasswordInput`, `Popover`, `Progress`, `RadioGroup`, `RenderConditionally`, `RenderAlternatively`, `Resizable`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Spinner`, `Stepper`, `Switch`, `Table`, `TablePagination`, `Tabs`, `Textarea`, `Timeline`, `Toast`, `Toaster`, `Toggle`, `ToggleGroup`, `Tooltip`, `WizardStepper`

- **Common Components**:
  - `AppSwitcher`, `ArchiveProject`, `BackToConsoleNavigator`, `ConfirmationModal`, `ConsoleHeader`, `CopyableSnippet`, `DashboardHeader`, `DashboardSectionCard`, `EnvironmentCard`, `EnvironmentList`, `EnvironmentSelected`, `ErrorBoundary`, `ErrorDisplay`, `LanguageSelector`, `LoaderSpinner`, `LoadingButton`, `LoginHeader`, `Logo`, `LogoutButton`, `ModeToggle`, `Notification`, `NotificationBell`, `NotificationHeader`, `NotificationItem`, `NotificationList`, `ProjectList`, `ProjectDetail`, `ProjectEdit`, `ProjectActions`, `SidebarMenu`, `ThemeSwitcher`, `UserDropdownMenu`, and more

#### `@seliseblocks/blocks-kit/hooks`

```tsx
import { useBoolean, useCopyToClipboard, useCountdown, useDebounced, useDebouncedFuseFilter, useFuseIndex, useFuseSearch, useLanguage, useLanguageSwitcher, useLogo, useLogout, useMediaQuery, useMenus, useMobile, useNotifications, useOrganization, usePathSegments, usePopoverWidth, useProject, useQueryClientKit, useQueryStatesKit, useServiceRegistry, useTheme, useImpersonation, useToast, useIcon, useInitiate, useBlocksAppConfigStore } from "@seliseblocks/blocks-kit/hooks";
```

#### `@seliseblocks/blocks-kit/store`

Zustand store for blocks app configuration.

#### `@seliseblocks/blocks-kit/providers`

React context providers for app state.

#### `@seliseblocks/blocks-kit/guards`

Route guard components:

- `AuthGuard`
- `ImpersonationGuard`
- `ProtectedGuard`
- `PublicGuard`

#### `@seliseblocks/blocks-kit/layouts`

Layout components:

- `AuthLayout`
- `BlocksAppLayout`
- `ConsoleLayout`
- `DashboardLayout`
- `OidcLayout`
- `ProjectOverviewLayout`
- `PublicLayout`

#### `@seliseblocks/blocks-kit/http`

HTTP client utilities:

- `HttpClient`
- `HttpError`
- `createHttpClient`
- `httpClient` (default instance)

#### `@seliseblocks/blocks-kit/utils`

Utility functions for common operations.

#### `@seliseblocks/blocks-kit/models`

TypeScript interfaces and types:

- `IAuth`, `IImpersonation`, `INotification`, `IOrganization`, `IProject`, `IServiceRegistry`, `IUser`

#### `@seliseblocks/blocks-kit/types`

Shared TypeScript types.

#### `@seliseblocks/blocks-kit/pages`

Pre-built page components:

- `CallbackPage`
- `ConsolePage`
- `DashboardOverviewPage`

## Usage Examples

### Using a Core Component

```tsx
import { Button, Card } from "@seliseblocks/blocks-kit/components";

function MyComponent() {
  return (
    <Card>
      <Button variant="default">Click Me</Button>
    </Card>
  );
}
```

### Using Hooks

```tsx
import { useToast, useBoolean } from "@seliseblocks/blocks-kit/hooks";

function MyComponent() {
  const { toast } = useToast();
  const { value: isOpen, toggle } = useBoolean(false);

  return (
    <button
      onClick={() => {
        toggle();
        toast({ title: "Button clicked!" });
      }}
    >
      Toggle
    </button>
  );
}
```

### Using Layouts and Guards

```tsx
import { BlocksAppLayout, DashboardLayout, ProtectedGuard } from "@seliseblocks/blocks-kit";

function App() {
  return (
    <BlocksAppLayout>
      <ProtectedGuard>
        <DashboardLayout>
          <YourDashboardContent />
        </DashboardLayout>
      </ProtectedGuard>
    </BlocksAppLayout>
  );
}
```

### Using HTTP Client

```tsx
import { httpClient } from "@seliseblocks/blocks-kit/http";

async function fetchData() {
  const data = await httpClient.get("/api/resource");
  return data;
}
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes.

## License

MIT © SELISE Blocks
