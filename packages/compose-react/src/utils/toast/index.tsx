import { tStatic } from "@/i18n";
import { toast } from "@/hooks/use-toast";
import { handleErrorMessages } from "@/utils/error";

type SuccessToastOptions = {
  title?: string;
  description: string;
};
type InfoToastOptions = {
  title?: string;
  description: string;
};
type ErrorToastOptions = {
  title?: string;
  errors: unknown;
  customMessages?: Record<string, string>;
};

export const showSuccessToast = ({
  title = tStatic("common", "SUCCESS"),
  description,
}: SuccessToastOptions) => {
  toast({
    variant: "success",
    title,
    description,
  });
};
export const showInfoToast = ({
  title = tStatic("genesis.shared", "TOAST.INFO_TITLE"),
  description,
}: InfoToastOptions) => {
  toast({
    variant: "info",
    title,
    description,
  });
};
export const showErrorToast = ({
  title = tStatic("genesis.shared", "TOAST.FAILED_TITLE"),
  errors,
  customMessages,
}: ErrorToastOptions) => {
  const message = handleErrorMessages(errors, customMessages);
  toast({
    variant: "destructive",
    title,
    description: Array.isArray(message)
      ? message.map((item) => <div key={item}>{item}</div>)
      : message,
  });
};
