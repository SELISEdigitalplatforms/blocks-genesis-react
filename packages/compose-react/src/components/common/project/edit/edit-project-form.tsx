import { useT } from "@/i18n";
import {
  Button,
  DialogClose,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components";
import { useUpdateTenantGroup } from "@/hooks/use-project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  editProjectFormDefaultValues,
  editProjectFormSchema,
  type EditProjectFormSchema,
} from "./edit-project-form.schema";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { isErrorWithErrors } from "@/utils/error";
import { useQueryClient } from "@tanstack/react-query";

interface EditProjectFormProps {
  tenantGroupId: string;
  currentName: string;
  onAfterSubmit: () => void;
}

export const EditProjectForm = ({
  tenantGroupId,
  currentName,
  onAfterSubmit,
}: EditProjectFormProps) => {
  const { t } = useT("genesis.shared");
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useUpdateTenantGroup();

  const form = useForm<EditProjectFormSchema>({
    resolver: zodResolver(editProjectFormSchema),
    defaultValues: {
      ...editProjectFormDefaultValues,
      name: currentName,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: EditProjectFormSchema) => {
    try {
      const res = await mutateAsync({
        name: values.name,
        tenantGroupId,
      });

      if (res.isSuccess) {
        showSuccessToast({
          title: t("EDIT_PROJECT_FORM.TOAST_TITLE"),
          description: t("EDIT_PROJECT_FORM.TOAST_DESCRIPTION"),
        });
        queryClient.invalidateQueries({ queryKey: ["identifier", "project"] });
        queryClient.invalidateQueries({ queryKey: ["identifier", "projects"] });
        form.reset();
        onAfterSubmit();
      } else {
        showErrorToast({ errors: res.errors });
      }
    } catch (error) {
      if (isErrorWithErrors(error)) {
        showErrorToast({ errors: error.errors });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-medium-emphasis">
                {t("EDIT_PROJECT_FORM.NAME_LABEL")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("EDIT_PROJECT_FORM.NAME_PLACEHOLDER")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="mt-2 flex flex-row justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="w-20">
              {t("common:CANCEL")}
            </Button>
          </DialogClose>
          <Button
            size="sm"
            className="w-20"
            type="submit"
            disabled={
              !form.formState.isValid || isPending || !form.formState.isDirty
            }
          >
            {t("common:SAVE")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
