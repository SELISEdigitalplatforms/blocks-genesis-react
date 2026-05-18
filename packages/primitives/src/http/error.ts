/**
 * HTTP error.
 * @param status - The HTTP status code.
 * @param statusText - The HTTP status text.
 * @param response - The response object.
 * @param message - The error message.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly response: Response,
    message?: string,
  ) {
    super(message ?? `HTTP ${status}: ${statusText}`);
    this.name = "HttpError";
  }
}
