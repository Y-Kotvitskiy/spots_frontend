import React, { useState } from "react";
import cn from "classnames";

import styles from "./FormInput.module.scss";
import Icon from "../../shared/Icon";

export interface FormFieldCustomProps {
  label?: string;
  validate?: (value: string) => string;
  name: string;
  rightIcon?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

export type FormFieldProps = FormFieldCustomProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof FormFieldCustomProps>;

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  touched,
  type = "text",
  rightIcon,
  className,
  required,
  ...restProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = Boolean(touched && error);

  const isPasswordType = type === "password";
  const inputType = isPasswordType && showPassword ? "text" : type;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={styles.FormField}>
      {label && (
        <label htmlFor={name} className={styles.FormField__label}>
          {label}
          {required && <span className={styles.FormField__required}> *</span>}
        </label>
      )}

      <div className={styles.FormField__inputWrapper}>
        <input
          id={name}
          name={name}
          type={inputType}
          className={cn(styles.FormField__input, {
            [styles.FormField__input_error]: hasError,
            [styles.FormField__input_withIcon]: isPasswordType,
          })}
          {...restProps}
        />

        {isPasswordType && (
          <button
            type="button"
            className={styles.FormField__iconBtn}
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <Icon
              name={showPassword ? "eye" : "eye_closed"}
              className={styles.FormField__icon}
            />
          </button>
        )}
      </div>

      {hasError && <p className={styles.FormField__error}>{error}</p>}
    </div>
  );
};

export default FormField;
