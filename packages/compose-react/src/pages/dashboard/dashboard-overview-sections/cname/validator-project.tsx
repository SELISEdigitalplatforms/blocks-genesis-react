import { useT } from "@/i18n";
import { LoadingButton } from "@/components";
import { useValidateCNameProject } from "@/hooks/use-project";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

interface CnameValidatorProjectProps {
  isDomainVerified: boolean;
  cookieDomain: string;
}

export const CnameValidatorProject = ({
  isDomainVerified,
  cookieDomain,
}: CnameValidatorProjectProps) => {
  const { t } = useT("genesis.dashboard");
  const { mutateAsync, isPending } = useValidateCNameProject({ cookieDomain });

  const handleValidate = async () => {
    try {
      if (isDomainVerified) return;
      const res = await mutateAsync();
      if (res?.isSuccess) {
        showSuccessToast({ description: t("CNAME_VALIDATOR_PROJECT.SUCCESS") });
      } else {
        showErrorToast({
          errors: res?.errors ?? t("CNAME_VALIDATOR_PROJECT.FAILED"),
        });
      }
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        showErrorToast({ errors: error.errors });
      }
    }
  };

  return (
    <LoadingButton
      onClick={handleValidate}
      disabled={isPending || isDomainVerified}
      isLoading={isPending}
    >
      {t("CNAME_VALIDATOR_PROJECT.LOOKUP")}
    </LoadingButton>
  );
};
