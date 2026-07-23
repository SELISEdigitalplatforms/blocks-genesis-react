import { BlocksIcon } from "@/assets/icons/blocks-icon";
import { useTheme } from "./use-theme";

export function useIcon() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? (
    <BlocksIcon size={32} color="#DCDCDC" />
  ) : (
    <BlocksIcon size={32} color="#2D86C7" />
  );
}
