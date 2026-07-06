import { LoadingButton, toast } from "@/components";
import { useValidateCNameProject } from "@/hooks/use-project";

interface CnameValidatorProjectProps {
  isDomainVerified: boolean;
  cookieDomain: string;
}

export const CnameValidatorProject = ({
  isDomainVerified,
  cookieDomain,
}: CnameValidatorProjectProps) => {
  const { mutateAsync, isPending } = useValidateCNameProject({ cookieDomain });

  const handleValidate = async () => {
    try {
      if (isDomainVerified) return;
      const res = await mutateAsync();
      if (res?.isSuccess) {
        toast.success("CName is validated successfully");
      } else {
        toast.error(
          Object.values(res.errors ?? {})[0] ??
            "Could not verify the domain. Please make sure it is valid and try again.",
        );
      }
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        toast.error(
          (error as unknown as { errors: unknown[] }).errors[0] as string,
        );
      }
    }
  };

  return (
    <LoadingButton
      onClick={handleValidate}
      disabled={isPending || isDomainVerified}
      isLoading={isPending}>
      CNAME Lookup
    </LoadingButton>
  );
};
