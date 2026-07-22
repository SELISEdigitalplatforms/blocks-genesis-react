/**
 * Partially makes a type optional for specific keys.
 * @param T Type to make partial.
 * @param K Keys to make optional.
 * @returns Partial type with specified keys.
 * @example
 * ```ts
 * type PartialUser = PartialOnly<User, "email"> // { email?: string, name: string }
 * ```
 */
export type PartialOnly<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
