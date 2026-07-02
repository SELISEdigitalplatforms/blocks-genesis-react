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
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components";
import { CNameInstruction } from "@/components/common";
import { useUpdateProject } from "@/hooks/use-project";
import { useProjectStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleHelp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  editProjectFormDefaultValue,
  editProjectFormSchema,
  type EditProjectFormSchema,
} from "./schema";
type EditProjectFormProps = {
  formData: EditProjectFormSchema;
  onAfterSubmit: () => void;
};
export const EditProjectForm = ({
  onAfterSubmit,
  formData,
}: EditProjectFormProps) => {
  const { itemId } = useProjectStore().selectedProject || {
    itemId: "",
    tenantId: "",
  };
  const projectKey = useProjectStore().selectedProject?.tenantId || "";
  const { mutateAsync, isPending } = useUpdateProject({ projectKey });
  const [customDomainTooltipOpen, setCustomDomainTooltipOpen] = useState(false);
  const form = useForm({
    defaultValues: editProjectFormDefaultValue,
    values: formData,
    resolver: zodResolver(editProjectFormSchema),
  });
  const onSubmitHandler = async (values: EditProjectFormSchema) => {
    try {
      if (!itemId || !projectKey) return;
      const res = await mutateAsync({
        name: values.name,
        tenantGroupId: projectKey,
      });
      if (res.isSuccess) {
        toast.success("Project is updated successfully");
        form.reset();
        onAfterSubmit();
      } else {
        toast.error(res.errors as string);
      }
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        toast.error((error as unknown as { errors: unknown }).errors as string);
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
