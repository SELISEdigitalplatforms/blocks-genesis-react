import { getRuntimeEnv } from "@/lib/runtime-env";

export const resolveBaseUrl = (type: "user" | "project" | "os"): string => {
  if (typeof window === "undefined") return "";

  const directKey =
    type === "user"
      ? "userBaseUrl"
      : type === "project"
        ? "projectBaseUrl"
        : "BLOCKS_OS_BASE_URL";
  const directVal = getRuntimeEnv(directKey);
  if (directVal) return directVal;

  if (type === "user") {
    return (
      getRuntimeEnv("BLOCKS_IAM_BASE_URL") ||
      getRuntimeEnv("BLOCKS_API_BASE_URL") ||
      ""
    );
  } else if (type === "project") {
    return (
      getRuntimeEnv("BLOCKS_LOGIC_BASE_URL") ||
      getRuntimeEnv("BLOCKS_OS_API_BASE_URL") ||
      ""
    );
  } else {
    return (
      getRuntimeEnv("BLOCKS_OS_BASE_URL") ||
      getRuntimeEnv("BLOCKS_API_BASE_URL") ||
      ""
    );
  }
};
