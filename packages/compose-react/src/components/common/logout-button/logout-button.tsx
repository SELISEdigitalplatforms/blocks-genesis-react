import { Button } from "@/components/core/button";
import { useLogout } from "@/hooks/use-auth-api";
import { getQueryClient } from "@/providers/query.provider";
import { useAppSettingsStore } from "@/store";
import { useAuthStore } from "@/store/auth.store";
import { useProjectStore } from "@/store/project.store";

export function LogOutButton() {
  const queryClient = getQueryClient();
  const { reset } = useProjectStore();
  const { setUnAuthenticated, clearTokens } = useAuthStore();
  const { setSettings } = useAppSettingsStore();
  const { isPending, mutateAsync } = useLogout();

  const handleLogout = async () => {
    try {
      await mutateAsync();
      reset();
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
      onClick={handleLogout}>
      Logout
    </Button>
  );
}
