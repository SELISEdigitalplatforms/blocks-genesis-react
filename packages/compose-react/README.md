# @selisedigitalplatforms/blocks-kit

A comprehensive React app-shell composition package with reusable components, hooks, layouts, and utilities for building blocks applications.

## Installation

```bash
npm install @selisedigitalplatforms/blocks-kit
# or
yarn add @selisedigitalplatforms/blocks-kit
# or
pnpm add @selisedigitalplatforms/blocks-kit
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
- shared design tokens (CSS variables) for theming
- Any global CSS imports required by their design system

## Quick Start

```tsx
import { BlocksAppLayout, AuthGuard, useToast, Button } from "@selisedigitalplatforms/blocks-kit";

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

### Main Entry Point (`@selisedigitalplatforms/blocks-kit`)

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

#### `@selisedigitalplatforms/blocks-kit/components`

All UI components organized into:

- **Core Components** (Radix UI based):
  - `Accordion`, `Alert`, `AlertDialog`, `AspectRatio`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Command`, `ContextMenu`, `CopyToClipboardButton`, `DateRangePicker`, `Dialog`, `Drawer`, `DropdownMenu`, `FileUploader`, `Form`, `HoverCard`, `ImportFileModal`, `InfiniteScroller`, `Input`, `InputOTP`, `KanbanBoard`, `Label`, `MaskedText`, `Menubar`, `MultiSelect`, `NavigationMenu`, `Pagination`, `PasswordInput`, `Popover`, `Progress`, `RadioGroup`, `RenderConditionally`, `RenderAlternatively`, `Resizable`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Spinner`, `Stepper`, `Switch`, `Table`, `TablePagination`, `Tabs`, `Textarea`, `Timeline`, `Toast`, `Toaster`, `Toggle`, `ToggleGroup`, `Tooltip`, `WizardStepper`

- **Common Components**:
  - `AppSwitcher`, `ArchiveProject`, `BackToConsoleNavigator`, `ConfirmationModal`, `ConsoleHeader`, `CopyableSnippet`, `DashboardHeader`, `DashboardSectionCard`, `EnvironmentCard`, `EnvironmentList`, `EnvironmentSelected`, `ErrorBoundary`, `ErrorDisplay`, `LanguageSelector`, `LoaderSpinner`, `LoadingButton`, `LoginHeader`, `Logo`, `LogoutButton`, `ModeToggle`, `Notification`, `NotificationBell`, `NotificationHeader`, `NotificationItem`, `NotificationList`, `ProjectList`, `ProjectDetail`, `ProjectEdit`, `ProjectActions`, `SidebarMenu`, `ThemeSwitcher`, `UserDropdownMenu`, and more

#### `@selisedigitalplatforms/blocks-kit/hooks`

```tsx
import { useBoolean, useCopyToClipboard, useCountdown, useDebounced, useDebouncedFuseFilter, useFuseIndex, useFuseSearch, useLanguage, useLanguageSwitcher, useLogo, useLogout, useMediaQuery, useMenus, useMobile, useNotifications, useOrganization, usePathSegments, usePopoverWidth, useProject, useQueryClientKit, useQueryStatesKit, useServiceRegistry, useTheme, useImpersonation, useToast, useIcon, useInitiate, useBlocksAppConfigStore } from "@selisedigitalplatforms/blocks-kit/hooks";
```

#### `@selisedigitalplatforms/blocks-kit/store`

Zustand store for blocks app configuration.

#### `@selisedigitalplatforms/blocks-kit/providers`

React context providers for app state.

#### `@selisedigitalplatforms/blocks-kit/guards`

Route guard components:

- `AuthGuard`
- `ImpersonationGuard`
- `ProtectedGuard`
- `PublicGuard`

#### `@selisedigitalplatforms/blocks-kit/layouts`

Layout components:

- `AuthLayout`
- `BlocksAppLayout`
- `ConsoleLayout`
- `DashboardLayout`
- `OidcLayout`
- `ProjectOverviewLayout`
- `PublicLayout`

#### `@selisedigitalplatforms/blocks-kit/http`

HTTP client utilities:

- `HttpClient`
- `HttpError`
- `createHttpClient`
- `httpClient` (default instance)

#### `@selisedigitalplatforms/blocks-kit/utils`

Utility functions for common operations.

#### `@selisedigitalplatforms/blocks-kit/models`

TypeScript interfaces and types:

- `IAuth`, `IImpersonation`, `INotification`, `IOrganization`, `IProject`, `IServiceRegistry`, `IUser`

#### `@selisedigitalplatforms/blocks-kit/types`

Shared TypeScript types.

#### `@selisedigitalplatforms/blocks-kit/pages`

Pre-built page components:

- `CallbackPage`
- `ConsolePage`
- `DashboardOverviewPage`

## Usage Examples

### Using a Core Component

```tsx
import { Button, Card } from "@selisedigitalplatforms/blocks-kit/components";

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
import { useToast, useBoolean } from "@selisedigitalplatforms/blocks-kit/hooks";

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
import { BlocksAppLayout, DashboardLayout, ProtectedGuard } from "@selisedigitalplatforms/blocks-kit";

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
import { httpClient } from "@selisedigitalplatforms/blocks-kit/http";

async function fetchData() {
  const data = await httpClient.get("/api/resource");
  return data;
}
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes.

## License

MIT © SELISE Blocks
