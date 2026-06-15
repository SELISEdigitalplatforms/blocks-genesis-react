import type * as React from "react";
import { useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/project.store";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { HttpClient } from "@/lib/http";

interface ProjectGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export function ProjectGuard({
  children,
  fallbackPath = "/console",
}: ProjectGuardProps) {
  const navigate = useNavigate();
  const { selectedProject } = useProjectStore();

  useEffect(() => {
    if (!selectedProject) {
      navigate(fallbackPath, { replace: true });
    }
  }, [selectedProject, navigate, fallbackPath]);

  if (!selectedProject) return null;
  return <>{children}</>;
}

export const http = new HttpClient({
  baseURL: getRuntimeEnv("BLOCKS_OS_BASE_URL") || "",
  blocksKey: getRuntimeEnv("BLOCKS_X_BLOCKS_KEY") || "",
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty-pattern
export const UsePublic = async (
  all: { request: any; context: any },
  next: any,
) => {
  try {
    const res = await http.get(
      `https://dev-iam.blocksdevelopers.com/api/iam/me`,
      undefined,
      {
        absoluteUrl: true,
      },
    );
    console.log("res", res);
    //  return redirect("/console")
  } catch (err) {
    return redirect("/profile");
  }
};
