import type { HTMLAttributes } from "react";

import classes from "./Button.module.css";

export enum ButtonVariants {
  Success = "success",
  Default = "default",
}

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: `${ButtonVariants}`;
}

export const Button = (props: ButtonProps) => {
  const {
    className,
    variant = ButtonVariants.Default,
    isLoading,
    isDisabled,
    ...restProps
  } = props;

  return <button className={classes[variant]} {...restProps} />;
};
