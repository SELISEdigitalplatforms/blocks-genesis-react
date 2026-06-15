import { createQueryKeyFactory } from "./query-key-factory";
import type { BlocksQueryKey, UseQueryClientKitReturn } from "./types";

const userKeys = createQueryKeyFactory("users", (key) => ({
  detail: (id: string) => key("detail", id),
  list: (filters: { readonly page: number }) => key("list", filters),
}));

const detailKey = userKeys.detail("user-1");
const typedDetailKey: BlocksQueryKey<readonly ["users", "detail", string]> = detailKey;

declare const cache: Pick<UseQueryClientKitReturn, "getData" | "invalidate">;

void typedDetailKey;
void cache.getData<{ readonly name: string }>(userKeys.detail("user-1"));
void cache.invalidate(userKeys.all());
void cache.invalidate(userKeys.list({ page: 1 }));

// @ts-expect-error Cache helpers require branded keys from a query-key factory.
void cache.invalidate(["users"]);
