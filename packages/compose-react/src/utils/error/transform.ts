type ErrorRecord = Record<string, string | string[]>;

function formatFieldName(fieldPath: string): string {
  const lastPart = fieldPath.split(".").pop() || fieldPath;
  return (
    lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/_/g, " ")
  );
}

function appendNonFieldError(result: ErrorRecord, entry: string): void {
  const existing = result.non_field_error;
  if (!existing) {
    result.non_field_error = entry;
  } else if (Array.isArray(existing)) {
    result.non_field_error = [...existing, entry];
  } else {
    result.non_field_error = [existing, entry];
  }
}

function appendFieldError(
  result: ErrorRecord,
  fieldPath: string,
  message: string,
): void {
  const existing = result[fieldPath];
  if (!existing) {
    result[fieldPath] = message;
  } else if (Array.isArray(existing)) {
    existing.push(message);
  } else {
    result[fieldPath] = [existing, message];
  }
}

function applyDetailEntry(result: ErrorRecord, entry: unknown): void {
  if (!entry || typeof entry !== "object") return;
  const loc = (entry as { loc?: unknown }).loc;
  const msg = (entry as { msg?: unknown }).msg;
  if (!Array.isArray(loc) || typeof msg !== "string") return;

  const fieldPath = loc
    .filter((item) => !["body", "query", "path"].includes(String(item)))
    .join(".");
  if (!fieldPath) return;

  const normalizedMessage =
    msg === "field required"
      ? `${formatFieldName(fieldPath)} is required`
      : msg;
  appendFieldError(result, fieldPath, normalizedMessage);
}

export function ErrorTransformer(error: unknown): ErrorRecord {
  const fallback = { non_field_error: "Something went wrong" };

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const maybeError = error as { errors?: unknown };
  const errors = maybeError.errors;

  if (!errors || typeof errors !== "object") {
    return fallback;
  }

  const detail = (errors as { detail?: unknown }).detail;
  if (typeof detail === "string") {
    return { non_field_error: detail };
  }

  if (!Array.isArray(detail)) {
    return errors as ErrorRecord;
  }

  const result: ErrorRecord = {};
  for (const entry of detail) {
    if (typeof entry === "string") {
      appendNonFieldError(result, entry);
      continue;
    }
    applyDetailEntry(result, entry);
  }

  return Object.keys(result).length ? result : fallback;
}
