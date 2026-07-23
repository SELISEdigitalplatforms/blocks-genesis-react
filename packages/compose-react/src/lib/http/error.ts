export class HttpError extends Error {
  status: number;
  errors: Record<string, string | string[]>;

  constructor(status: number, error: { errors: Record<string, string | string[]> }) {
    super(JSON.stringify(error.errors));
    this.status = status;
    this.errors = error.errors;
  }
}
