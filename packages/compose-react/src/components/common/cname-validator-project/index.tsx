import { LoaderCircle } from "lucide-react";
import { Button, toast } from "@/components";
import { useGetProject, useValidateCNameProject } from "@/hooks/use-project";
import { useProjectStore } from "@/store";

export const CnameValidatorProject = () => {
  const projectKey = useProjectStore().selectedProject?.tenantId || "";
  const { itemId } = useProjectStore().selectedProject || {
    itemId: "",
    tenantId: "",
  };
  const { data } = useGetProject({ projectId: itemId });
  const { mutateAsync, isPending } = useValidateCNameProject({ projectKey });
  const cNameValidator = async () => {
    try {
      if (!data?.data.applicationDomain) return;
      const res = await mutateAsync();
      if (res.isValid) return toast.success("CName is validated successfully");
      toast.error(
        "Could not verify the domain. Please make sure it is valid and try again",
      );
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        toast.error(
          (error as unknown as { errors: unknown[] }).errors[0] as string,
        );
      }
    }
  };
  return (
    <Button onClick={cNameValidator} disabled={isPending} size="sm">
      {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      CNAME Lookup
    </Button>
  );
};
