import type { ChangeEventHandler, HTMLAttributes } from "react";

import classes from "./Select.module.css";

export interface Option {
  text: string;
  value: string;
}

export interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
  value: string;
  placeholder: string;
  shouldAllowEmpty?: boolean;
  options: Option[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

export const Select = (props: SelectProps) => {
  const {
    value,
    placeholder,
    shouldAllowEmpty,
    options,
    onChange,
    ...restProps
  } = props;

  return (
    <select
      className={classes.wrapper}
      value={value}
      onChange={onChange}
      {...restProps}
    >
      <option value="" disabled={!shouldAllowEmpty}>
        {placeholder}
      </option>
      {options.map(({ value, text }, index) => (
        <option key={index.toString()} value={value}>
          {text}
        </option>
      ))}
    </select>
  );
};
