import { tStatic, type TFunction } from "@/i18n";

const MODULE = "genesis.shared";

// Used when the caller has no `t` of its own (outside React).
const defaultT: TFunction = (key, values) => tStatic(MODULE, key, values);

type Meta = string | { kb_id?: string; status?: string };

export function formatKBTitle(str: string, t: TFunction = defaultT): string {
  if (!str) return t("NOTIFICATION_UTILS.NO_TITLE");
  if (str === "agent_kb_processing_status")
    return t("NOTIFICATION_UTILS.KB_STATUS_TITLE");
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getKBMetaInfo(meta: Meta): { kb_id?: string; status?: string } {
  try {
    if (typeof meta === "string") return JSON.parse(meta);
    if (typeof meta === "object" && meta !== null) return meta;
  } catch (error) {
    console.error("Failed to parse meta:", error);
  }
  return {};
}

export function formatKBMetaDescription(
  meta: Meta,
  fallbackDescription?: string,
  t: TFunction = defaultT,
): string {
  const { status, kb_id } = getKBMetaInfo(meta);
  const formattedStatus = status
    ? t("NOTIFICATION_UTILS.STATUS", {
        status: status.charAt(0).toUpperCase() + status.slice(1),
      })
    : null;
  const formattedKbId = kb_id
    ? t("NOTIFICATION_UTILS.KB_ID", { id: kb_id.split("-")[0] ?? kb_id })
    : null;

  if (formattedStatus && formattedKbId)
    return `${formattedStatus} | ${formattedKbId}`;
  if (formattedStatus) return formattedStatus;
  if (formattedKbId) return formattedKbId;
  return fallbackDescription || t("NOTIFICATION_UTILS.NO_DESCRIPTION");
}
