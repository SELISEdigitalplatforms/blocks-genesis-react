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
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components";
import { CNameInstruction } from "@/components/common";
import { useUpdateTenantGroup } from "@/hooks/use-project";
import { useProjectStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleHelp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  editDomainFormDefaultValue,
  editDomainFormSchema,
  type EditDomainFormSchema,
} from "./schema";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
type EditDomainFormProps = {
  formData: EditDomainFormSchema;
  onAfterSubmit: () => void;
};
export const EditDomainForm = ({
  onAfterSubmit,
  formData,
}: EditDomainFormProps) => {
  const { itemId } = useProjectStore().selectedProject || {
    itemId: "",
    tenantId: "",
  };
  const { mutateAsync, isPending } = useUpdateTenantGroup();
  const [customDomainTooltipOpen, setCustomDomainTooltipOpen] = useState(false);
  const form = useForm({
    defaultValues: editDomainFormDefaultValue,
    values: formData,
    resolver: zodResolver(editDomainFormSchema),
  });
  const onSubmitHandler = async (values: EditDomainFormSchema) => {
    try {
      if (!itemId) return;
      const res = await mutateAsync({
        name: values.name,
        tenantGroupId: itemId,
      });
      if (res.isSuccess) {
        showSuccessToast({ description: "Project is updated successfully" });
        form.reset();
        onAfterSubmit();
      } else {
        showErrorToast({ errors: res.errors });
      }
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        showErrorToast({
          errors: (error as { errors: unknown }).errors as string,
        });
      }
    }
  };
  const cookieDomainName = form.watch("cookieDomain");
  const { isValid } = form.formState;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">Application Domain</div>
          <div className="text-sm text-muted-foreground">
            {formData.applicationDomain || "N/A"}
          </div>
        </div>
        <FormField
          control={form.control}
          name="useCustomDomain"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">
                  Use a custom domain?
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("useCustomDomain") && (
          <FormField
            control={form.control}
            name="customDomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Enter your custom domain below
                  <TooltipProvider>
                    <Tooltip open={customDomainTooltipOpen}>
                      <TooltipTrigger
                        className="peer"
                        type="button"
                        onMouseEnter={() => setCustomDomainTooltipOpen(true)}
                        onMouseLeave={() => setCustomDomainTooltipOpen(false)}
                      >
                        <CircleHelp className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-96 text-sm font-normal">
                        Enter the full URL of the custom domain or subdomain
                        where your app will be hosted (e.g., https://example.com
                        or https://app.example.com).
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Custom domain URL"
                    className="mt-2"
                  />
                </FormControl>
                <FormMessage />
                <CNameInstruction
                  cookieDomainName={cookieDomainName || ""}
                  customDomain={form.getValues("customDomain")}
                />
              </FormItem>
            )}
          />
        )}
        <DialogFooter className="flex flex-row justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="w-20">
              Cancel
            </Button>
          </DialogClose>
          <Button className="w-20" disabled={!isValid || isPending}>
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
