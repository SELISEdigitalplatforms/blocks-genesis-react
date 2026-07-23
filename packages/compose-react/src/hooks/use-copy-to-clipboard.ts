import { useState } from "react";

/**
 * Options accepted by the clipboard `copy` action.
 */
export type CopyOptions = {
  /** Callback executed after a successful copy operation. */
  onSuccess?: () => void;
  /** Callback executed when copy fails. */
  onError?: (error: Error) => void;
  /** Delay in milliseconds before `isCopying` resets to `false`. */
  resetAfterMs?: number;
};

/**
 * Provides clipboard copy state and actions for browser environments.
 *
 * Notes:
 * - Uses the async Clipboard API (`navigator.clipboard.writeText`).
 * - Returns `false` when API support is unavailable or copy fails.
 *
 * @returns Copy action, pending state, last copied text, and last error.
 */
export const useCopyToClipboard = () => {
  const [isCopying, setIsCopying] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const copy = async (
    text: string,
    options: CopyOptions = {},
  ): Promise<boolean> => {
    if (isCopying) return false;

    const { onSuccess, onError, resetAfterMs = 500 } = options;

    if (!navigator?.clipboard?.writeText) {
      const clipboardError = new Error("Clipboard API not supported");
      setError(clipboardError);
      onError?.(clipboardError);
      return false;
    }

    try {
      setIsCopying(true);
      setError(null);
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      onSuccess?.();
      return true;
    } catch (unknownError) {
      const copyError =
        unknownError instanceof Error
          ? unknownError
          : new Error("Unknown clipboard error");
      setError(copyError);
      onError?.(copyError);
      return false;
    } finally {
      setTimeout(() => setIsCopying(false), resetAfterMs);
    }
  };

  return {
    isCopying,
    copiedText,
    error,
    copy,
  };
};
