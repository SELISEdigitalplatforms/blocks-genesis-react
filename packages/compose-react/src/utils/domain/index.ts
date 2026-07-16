import type { IProject } from "@/models";

export const domainRegex =
  /^(https?:\/\/)((?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,})$/;

export const isValidDomain = (domain: string) =>
  domainRegex.test(domain.trim());

export const subdomainRegex =
  /^(https?:\/\/)(?!-)([A-Za-z0-9-]{1,63}\.)*[A-Za-z0-9-]{1,63}(?<!-)$/;

export const isValidSubdomain = (subdomain: string) =>
  !!subdomain && subdomainRegex.test(subdomain);

export const getDomain = (url: string = "") => {
  const trimUrl = url.trim();
  if (!isValidDomain(trimUrl)) return "";
  const hostname = new URL(trimUrl).hostname;
  const splits = hostname.split(".");
  return splits.slice(splits.length - 2).join(".");
};

export const getSubdomain = (url: string = "") => {
  if (!url || url === "") return "";
  if (!isValidDomain(url)) return "";
  const trimUrl = url.trim();
  if (!trimUrl) return "";
  try {
    const parsedUrl = new URL(trimUrl);
    const hostname = parsedUrl.hostname;
    const splits = hostname.split(".");
    if (splits.length <= 2) return "";
    const subdomain = splits.slice(0, splits.length - 2).join(".");
    if (!subdomain) return "";
    return `${parsedUrl.protocol}//${subdomain}`;
  } catch {
    return "";
  }
};

export const getProjectBlocksApiUrl = (project?: IProject): string => {
  if (!project) return "";
  const baseUrl = window.process?.env.BLOCKS_PUBLIC_API_BASE_URL;
  if (!baseUrl) return "";
  return project.customDomain
    ? "blocksapi." + getDomain(project.customDomain)
    : baseUrl;
};
