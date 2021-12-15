import type { HTMLAttributes } from "react";
import cn from "classnames";

export enum ButtonVariants {
  Success = "success",
}

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: `${ButtonVariants}`;
}

export const Button = (props: ButtonProps) => {
  const { className, variant, isLoading, isDisabled, ...restProps } = props;

  return (
    <button
      className={cn(className, variant === ButtonVariants.Success && "success")}
      {...restProps}
    />
  );
};
