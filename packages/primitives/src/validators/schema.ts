import type { ValidationResult, Validator } from "./types";

/**
 * Create a schema validator.
 * @param schema - The schema to validate.
 * @description Create a schema validator that validates an object against the specified schema.
 * @returns The schema validator.
 */
export const createSchema = <T extends Record<string, Validator<unknown>>>(schema: T) => {
  return (
    data: unknown,
  ): ValidationResult<{ [K in keyof T]: T[K] extends Validator<infer U> ? U : never }> => {
    if (typeof data !== "object" || data === null) {
      return { success: false, error: "Expected an object" };
    }

    const result = {} as Record<string, unknown>;
    const entries = Object.entries(schema);
    for (const [key, validator] of entries) {
      const value = (data as Record<string, unknown>)[key];
      const validation = validator(value);
      if (!validation.success) {
        return { success: false, error: `Field "${key}": ${validation.error}` };
      }
      result[key] = validation.data;
    }

    return {
      success: true,
      data: result as { [K in keyof T]: T[K] extends Validator<infer U> ? U : never },
    };
  };
};

/**
 * String validator.
 * @param message - The error message to use.
 * @description Validate a string.
 * @returns The string validator.
 */
export const string =
  (message = "Expected a string"): Validator<string> =>
  (val) =>
    typeof val === "string" ? { success: true, data: val } : { success: false, error: message };

/**
 * Number validator.
 * @param message - The error message to use.
 * @description Validate a number.
 * @returns The number validator.
 */
export const number =
  (message = "Expected a number"): Validator<number> =>
  (val) =>
    typeof val === "number" && !isNaN(val)
      ? { success: true, data: val }
      : { success: false, error: message };

/**
 * Boolean validator.
 * @param message - The error message to use.
 * @description Validate a boolean.
 * @returns The boolean validator.
 */
export const boolean =
  (message = "Expected a boolean"): Validator<boolean> =>
  (val) =>
    typeof val === "boolean" ? { success: true, data: val } : { success: false, error: message };
