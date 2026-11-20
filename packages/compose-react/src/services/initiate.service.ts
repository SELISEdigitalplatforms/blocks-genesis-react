import { IAM_ENDPOINTS } from "@/constants/endpoint.constant";
import { getRuntimeEnv } from "@/lib";
import { HttpError } from "@/lib/http/error";

export interface InitiateParams {
  clientId: string;
  redirectUri: string;
  forwardedTo: string;
}

/** IAM's `error_description` is kept to this many characters. */
export const INITIATE_ERROR_DESCRIPTION_MAX_LENGTH = 300;

/**
 * IAM's `/idp/initiate` refused to hand out a redirect URL.
 *
 * An `HttpError`, so query error reporting treats it as an IAM answer (IAM logs its own rejections)
 * rather than a bug in the query function. Unlike a plain `HttpError`, `message` stays readable for
 * callers of `useInitiateRedirect`, and IAM's OAuth-style `error` / `error_description` are kept as
 * `code` / `description`. Nothing from the request (blocks key, query string, headers) is copied in.
 */
export class InitiateError extends HttpError {
  /** IAM's `error`, e.g. `invalid_redirect_uri`; `null` when the body had none. */
  readonly code: string | null;
  /** IAM's `error_description`, cut to `INITIATE_ERROR_DESCRIPTION_MAX_LENGTH`; `null` when absent. */
  readonly description: string | null;

  constructor(
    status: number,
    {
      code = null,
      description = null,
      message,
    }: { code?: string | null; description?: string | null; message?: string },
  ) {
    const general = `Initiate request failed — HTTP ${status}`;
    super(status, { errors: code ? { general, code } : { general } });
    this.name = "InitiateError";
    this.code = code;
    this.description =
      description?.slice(0, INITIATE_ERROR_DESCRIPTION_MAX_LENGTH) ?? null;
    this.message = message ?? (code ? `${general} (${code})` : general);
  }
}

const stringField = (body: unknown, field: string): string | null => {
  const value = (body as Record<string, unknown> | null)?.[field];
  return typeof value === "string" && value ? value : null;
};

/** Reads IAM's error fields from a non-2xx body. An empty or non-JSON body yields neither. */
const readRejection = async (response: Response, signal?: AbortSignal) => {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch (error) {
    // An abort while reading stays an abort, as it would have been before the body was read.
    if (signal?.aborted) throw error;
    // Not JSON (a proxy's HTML page, an empty body): the status alone describes the failure.
  }
  return {
    code: stringField(body, "error"),
    description: stringField(body, "error_description"),
  };
};

class InitiateService {
  async fetchRedirectUrl(
    { clientId, redirectUri, forwardedTo }: InitiateParams,
    signal?: AbortSignal,
  ): Promise<string> {
    const blocksKey = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
    const iamBaseUrl = getRuntimeEnv("userBaseUrl");

    const params = new URLSearchParams({
      "x-blocks-key": blocksKey,
      clientId,
      redirectUri,
      forwardedTo,
    });
    const headers: Record<string, string> = { Accept: "application/json" };
    if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

    const response = await fetch(
      `${iamBaseUrl}${IAM_ENDPOINTS.INITIATE}?${params}`,
      { headers, signal },
    );

    if (!response.ok) {
      throw new InitiateError(
        response.status,
        await readRejection(response, signal),
      );
    }

    const data = await response.json();
    // IAM answered but without a URL to send the user to: a bad upstream response (502).
    if (typeof data?.redirect_uri !== "string" || !data.redirect_uri)
      throw new InitiateError(502, {
        message: "No redirect_uri in initiate response",
      });

    return data.redirect_uri;
  }
}

export const initiateService = new InitiateService();
