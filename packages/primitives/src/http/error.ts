import type { HttpMethod } from "./types";

/**
 * Additional metadata attached to `HttpError`.
 */
export type HttpErrorDetails = {
  /** Parsed error body when available. */
  data?: unknown;
  /** Request URL. */
  url?: string;
  /** Effective request method. */
  method?: HttpMethod;
};

/**
 * Error thrown for non-successful HTTP responses.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly response: Response;
  readonly data?: unknown;
  readonly url?: string;
  readonly method?: HttpMethod;

  /**
   * Creates an `HttpError` instance.
   *
   * @param status HTTP status code.
   * @param statusText HTTP status message.
   * @param response Raw response object.
   * @param details Optional parsed payload and request metadata.
   */
  constructor(status: number, statusText: string, response: Response, details: HttpErrorDetails = {}) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.data = details.data;
    this.url = details.url;
    this.method = details.method;
  }
}
