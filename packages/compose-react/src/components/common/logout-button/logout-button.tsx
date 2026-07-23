import { Button } from "@/components/core/button";
import { useLogout } from "@/hooks/use-logout";
import { getQueryClient } from "@/providers/query.provider";
import { useAppSettingsStore } from "@/store";
import { useAuthStore } from "@/store/auth.store";
import { useProjectStore } from "@/store/project.store";

/**
 * Renders a "Logout" button that fully tears down the authenticated session.
 *
 * On click it calls the logout mutation, then clears the project store,
 * auth state, and tokens, resets the language setting, empties the query
 * cache, and finally redirects to the login page. The button is disabled
 * while the logout request is in flight. Any failure is logged and leaves
 * the user on the current page (no redirect).
 */
export function LogOutButton() {
  const queryClient = getQueryClient();
  const { resetProjectStore } = useProjectStore();
  const { setUnAuthenticated, clearTokens } = useAuthStore();
  const { setSettings } = useAppSettingsStore();
  const { isPending, mutateAsync } = useLogout();

  const handleLogout = async () => {
    try {
      await mutateAsync();
      resetProjectStore();
      setUnAuthenticated();
      clearTokens();
      setSettings({ language: "en" });
      queryClient.clear();
      window.location.replace(`${window.location.origin}/login`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      variant="link"
      size="sm"
      className="text-error flex h-full w-full justify-start !p-0 hover:no-underline"
      disabled={isPending}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
