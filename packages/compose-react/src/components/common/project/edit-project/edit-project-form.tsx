import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { useGetProject, useUpdateProject } from "@/hooks/use-project";
import { getDomain } from "@/lib/domain";
import { useProjectStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleHelp, InfoIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { editProjectFormDefaultValue, editProjectFormSchema } from "./schema";
type EditProjectFormProps = {
  onAfterSubmit: () => void;
};
export const EditProjectForm = ({ onAfterSubmit }: EditProjectFormProps) => {
  const { itemId } = useProjectStore().selectedProject || {
    itemId: "",
    tenantId: "",
  };
  const projectKey = useProjectStore().selectedProject?.tenantId || "";
  const { data } = useGetProject({ projectId: itemId });
  const { mutateAsync, isPending } = useUpdateProject({ projectKey });
  const [customDomainTooltipOpen, setCustomDomainTooltipOpen] = useState(false);
  const form = useForm({
    defaultValues: editProjectFormDefaultValue,
    values: data?.data
      ? {
          ...data.data,
          useCustomDomain:
            data.data.customDomain && data.data.customDomain.trim() !== ""
              ? true
              : false,
          customDomain: data.data.customDomain || "",
          applicationDomain: data.data.applicationDomain
            ? data.data.applicationDomain.replace(
                `.${getDomain(data.data.applicationDomain)}`,
                "",
              )
            : "",
        }
      : undefined,
    resolver: zodResolver(editProjectFormSchema),
  });
  const onSubmitHandler = async (
    values: typeof editProjectFormDefaultValue,
  ) => {
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
            {data?.data.applicationDomain}
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
const CNameInstruction = ({
  cookieDomainName,
  customDomain,
}: {
  cookieDomainName: string;
  customDomain?: string;
}) => {
  const apiBaseUrl = "blocksapi." + cookieDomainName;
  return (
    <Card className="h-60 overflow-y-auto rounded-sm px-4 py-3 text-base font-normal text-high-emphasis shadow-none">
      <CardHeader className="!p-0">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <InfoIcon className="h-6 w-6 text-neutral-300" />
          DNS CNAME Record for Domain Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="my-2.5 !p-0">
        <div>
          <h4>
            Please add the following
            {cookieDomainName ? " two CNAME records" : " CNAME record"} to your
            DNS configuration to complete domain validation:
          </h4>
          {cookieDomainName && (
            <>
              <p className="mt-3 font-semibold">CNAME configuration 1</p>
              <ul className="mt-2 list-disc pl-5">
                <li>
                  Host:{" "}
                  <span className="font-semibold">
                    {customDomain?.split("//")[1]}
                  </span>
                </li>
                <li className="my-2">Type: CNAME</li>
                <li>
                  Value:{" "}
                  <span className="font-semibold">
                    blocksapi.seliseblocks.com
                  </span>
                </li>
              </ul>
              <p className="mt-3 font-semibold">CNAME configuration 2</p>
            </>
          )}
          <ul className="mt-2 list-disc pl-5">
            <li>
              Host: <span className="font-semibold">{apiBaseUrl}</span>
            </li>
            <li className="my-2">Type: CNAME</li>
            <li>
              Value:{" "}
              <span className="font-semibold">blocksapi.seliseblocks.com</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
