/**
 * Result shape returned by validator functions.
 *
 * @typeParam T Validated data type.
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validator function signature.
 *
 * @typeParam T Validated data type.
 */
export type Validator<T> = (val: unknown) => ValidationResult<T>;
