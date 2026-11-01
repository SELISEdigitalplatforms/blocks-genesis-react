import { tStatic } from "@/i18n";
import { z } from "zod";

// Messages are read when validation runs, so a language change is picked up.
const MODULE = "genesis.dashboard";

const domainRegex =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

export const domainFormSchema = z.object({
  domain: z
    .string()
    .min(1, {
      error: () => tStatic(MODULE, "DOMAIN_FORM_SCHEMA.DOMAIN_REQUIRED"),
    })
    .regex(domainRegex, {
      error: () => tStatic(MODULE, "DOMAIN_FORM_SCHEMA.DOMAIN_INVALID"),
    }),
  cookieDomain: z
    .string()
    .min(1, {
      error: () => tStatic(MODULE, "DOMAIN_FORM_SCHEMA.COOKIE_DOMAIN_REQUIRED"),
    })
    .regex(domainRegex, {
      error: () => tStatic(MODULE, "DOMAIN_FORM_SCHEMA.DOMAIN_INVALID"),
    }),
});

export type DomainFormSchema = z.infer<typeof domainFormSchema>;

export const domainFormDefaultValues: DomainFormSchema = {
  domain: "",
  cookieDomain: "",
};
