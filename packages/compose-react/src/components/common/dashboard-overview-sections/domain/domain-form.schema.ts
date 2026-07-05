import { z } from "zod";

export const domainFormSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .url("Please enter a valid URL (e.g. https://example.com)"),
  cookieDomain: z
    .string()
    .min(1, "Cookie domain is required")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
      "Please enter a valid domain (e.g. example.com)",
    ),
});

export type DomainFormSchema = z.infer<typeof domainFormSchema>;

export const domainFormDefaultValues: DomainFormSchema = {
  domain: "",
  cookieDomain: "",
};
