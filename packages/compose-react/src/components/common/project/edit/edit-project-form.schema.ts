import { tStatic } from "@/i18n";
import { z } from "zod";

export const editProjectFormSchema = z.object({
  name: z.string().min(1, {
    error: () =>
      tStatic("genesis.shared", "EDIT_PROJECT_FORM_SCHEMA.NAME_REQUIRED"),
  }),
});

export type EditProjectFormSchema = z.infer<typeof editProjectFormSchema>;

export const editProjectFormDefaultValues: EditProjectFormSchema = {
  name: "",
};
