import { useT } from "@/i18n";

/** Screen-reader text of a close button, in the chosen language. */
export const SrClose = () => {
  const { t } = useT("genesis.shared");
  return <span className="sr-only">{t("common:CLOSE")}</span>;
};
