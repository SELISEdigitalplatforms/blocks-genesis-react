/**
 * Validation result.
 * @template T - The type of the data to validate.
 * @description The validation result type. Either a success result with an optional data payload, or a error result with an error message payload.
 */
export type ValidationResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Validator function.
 * @template T - The type of the data to validate.
 * @description The validator function type.
 */
export type Validator<T> = (val: unknown) => ValidationResult<T>;
