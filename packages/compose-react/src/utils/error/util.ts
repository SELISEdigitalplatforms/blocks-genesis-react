export const isErrorWithErrors = (
  error: unknown,
): error is { errors: Record<string, string | string[]> } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    typeof (error as { errors: unknown }).errors === "object" &&
    (error as { errors: unknown }).errors !== null
  );
};

export const hasErrorCode = (
  errors: Record<string, string | string[]>,
  code: string,
): boolean => {
  const value = errors[code];
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.length > 0;
  return value.length > 0;
};

export const getErrorMessage = (
  error: Record<string, string | string[]>,
  messageMap: Record<string, string> = {},
): string | string[] => {
  if (!error || Object.keys(error).length === 0) {
    return "Something went wrong.";
  }

  // A Set keeps the first-seen order and shows each distinct text once: a normalized transport
  // failure carries the same text under both `general` and `message`, and callers render the
  // list with each text as its React key.
  const messages = new Set<string>();

  for (const key in error) {
    const value = error[key];

    if (messageMap[key]) {
      messages.add(messageMap[key]);
      continue;
    }

    if (typeof value === "string") {
      messages.add(value);
    } else if (Array.isArray(value) && value.length > 0) {
      messages.add(value.join(", "));
    }
  }

  return messages.size ? [...messages] : "Something went wrong.";
};

export const handleErrorMessages = (
  errors: unknown,
  customMessages?: Record<string, string>,
): string | string[] => {
  if (typeof errors === "string") return errors;

  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    return getErrorMessage(
      errors as Record<string, string | string[]>,
      customMessages,
    );
  }

  return "An unexpected error occurred.";
};
