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
  toast,
} from "@/components";
import { useUpdateProject } from "@/hooks/use-project";
import type { IDomain } from "@/models/project.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  domainFormDefaultValues,
  domainFormSchema,
  type DomainFormSchema,
} from "./domain-form.schema";
import { DomainAction } from "./domain.constant";

interface DomainFormProps {
  /**
   * Pass an existing application to enter edit mode.
   * Omit (or pass null) for add mode.
   */
  application?: IDomain | null;
  onAfterSubmit: () => void;
}

export const DomainForm = ({ application, onAfterSubmit }: DomainFormProps) => {
  const isEditMode = !!application;
  const { mutateAsync, isPending } = useUpdateProject();

  const form = useForm<DomainFormSchema>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: isEditMode
      ? { domain: application.domain, cookieDomain: application.cookieDomain }
      : domainFormDefaultValues,
    mode: "onChange",
  });

  const onSubmit = async (values: DomainFormSchema) => {
    try {
      const res = await mutateAsync({
        action: isEditMode ? DomainAction.Edit : DomainAction.Add,
        // Sends the original domain so the BE knows which record to update
        ...(isEditMode && { applicationDomain: application.domain }),
        application: {
          domain: values.domain,
          cookieDomain: values.cookieDomain,
          // Preserve existing verification status on edit; false on add
          isDomainVerified: isEditMode ? application.isDomainVerified : false,
        },
      });

      if (res.isSuccess) {
        toast.success(
          isEditMode
            ? "Application updated successfully"
            : "Application added successfully",
        );
        form.reset();
        onAfterSubmit();
      } else {
        toast.error(res.errors as string);
      }
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        toast.error((error as { errors: unknown }).errors as string);
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
          name="domain"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-medium-emphasis">
                Domain
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://your-domain.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cookieDomain"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-medium-emphasis">
                Cookie Domain
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="your-domain.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="mt-2 flex flex-row justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="w-20">
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            className="w-20"
            type="submit"
            disabled={!form.formState.isValid || isPending}
          >
            {isEditMode ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
