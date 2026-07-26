import {
  Button,
  RenderConditionally,
  type ButtonProps,
} from "@/components/core";
import { LoaderCircle } from "lucide-react";
import type { PropsWithChildren } from "react";

type LoadingButtonProps = PropsWithChildren &
  ButtonProps & {
    isLoading?: boolean;
    loadingIcon?: React.ReactNode;
  };

export function LoadingButton({ children, ...props }: LoadingButtonProps) {
  const {
    onClick,
    disabled,
    size = "sm",
    loadingIcon,
    isLoading = false,
    ...rest
  } = props;
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      size={size}
      className="gap-2"
      {...rest}
    >
      <RenderConditionally condition={isLoading}>
        {loadingIcon || <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      </RenderConditionally>
      {children}
    </Button>
  );
}
