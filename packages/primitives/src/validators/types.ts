/**
 * @type ValidationResult
 * @description - The validation result type.
 * @template T - The type of the data to validate.
 * @property {boolean} success - Whether the validation was successful or not.
 * @property {T} data - The validated data, if successful.
 * @property {string} error - The error message, if validation failed.
 */
export type ValidationResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * @type Validator
 * @description - The validator function type.
 * @template T - The type of the data to validate.
 * @property {unknown} val - The value to validate.
 * @returns {ValidationResult<T>} - The validation result.
 */
export type Validator<T> = (val: unknown) => ValidationResult<T>;
