export type ValidationResult<T> = { success: true; data: T } | { success: false; error: string };

export type Validator<T> = (val: unknown) => ValidationResult<T>;

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

export const string =
  (message = "Expected a string"): Validator<string> =>
  (val) =>
    typeof val === "string" ? { success: true, data: val } : { success: false, error: message };

export const number =
  (message = "Expected a number"): Validator<number> =>
  (val) =>
    typeof val === "number" && !isNaN(val)
      ? { success: true, data: val }
      : { success: false, error: message };

export const boolean =
  (message = "Expected a boolean"): Validator<boolean> =>
  (val) =>
    typeof val === "boolean" ? { success: true, data: val } : { success: false, error: message };
