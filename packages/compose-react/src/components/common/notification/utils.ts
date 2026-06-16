type Meta = string | { kb_id?: string; status?: string };

export function formatKBTitle(str: string): string {
  if (!str) return "No Title";
  if (str === "agent_kb_processing_status")
    return "AI Agent Knowledge Update Status";
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
): string {
  const { status, kb_id } = getKBMetaInfo(meta);
  const formattedStatus = status
    ? `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`
    : null;
  const formattedKbId = kb_id ? `KB Id: ${kb_id.split("-")[0]}` : null;

  if (formattedStatus && formattedKbId)
    return `${formattedStatus} | ${formattedKbId}`;
  if (formattedStatus) return formattedStatus;
  if (formattedKbId) return formattedKbId;
  return fallbackDescription || "No Description";
}
