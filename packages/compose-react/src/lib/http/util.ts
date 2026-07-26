import { getRuntimeEnv } from "@/lib/runtime-env";

export const resolveBaseUrl = (
  type: "user" | "project" | "notification",
): string => {
  if (typeof window === "undefined") return "";

  const directKeyMap = {
    user: "userBaseUrl",
    project: "projectBaseUrl",
    notification: "notificationBaseUrl",
  } as const;
  const directKey = directKeyMap[type];
  const directVal = getRuntimeEnv(directKey);
  if (directVal) return directVal;

  if (type === "user") {
    return getRuntimeEnv("BLOCKS_IAM_BASE_URL") || "";
  } else if (type === "notification") {
    return getRuntimeEnv("BLOCKS_LOGIC_BASE_URL") || "";
  } else {
    return getRuntimeEnv("BLOCKS_OS_BASE_URL") || "";
  }
};
