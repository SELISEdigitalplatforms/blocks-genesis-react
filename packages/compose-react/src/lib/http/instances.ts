import { HttpClient } from "@/lib/http";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { resolveBaseUrl } from "./util";

export const iamClient = new HttpClient({
  baseURL: () => resolveBaseUrl("user"),
  blocksKey: () => getRuntimeEnv("BLOCKS_X_BLOCKS_KEY"),
});

export const logicClient = new HttpClient({
  baseURL: () => resolveBaseUrl("project"),
  blocksKey: () => getRuntimeEnv("BLOCKS_X_BLOCKS_KEY"),
});

export const notificationClient = new HttpClient({
  baseURL: () => resolveBaseUrl("notification"),
  blocksKey: () => getRuntimeEnv("BLOCKS_X_BLOCKS_KEY"),
});
