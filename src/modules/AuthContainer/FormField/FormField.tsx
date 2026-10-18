import React from "react";
import cn from "classnames";

import styles from "./FormInput.module.scss";

// 1. Окремий тип для пропсів, які стосуються Formik та кастомної обгортки
export interface FormFieldCustomProps {
  label?: string;
  validate?: (value: string) => string;
  name: string;
  rightIcon?: string;
  error?: string;
  touched?: boolean;
}

// 2. Об'єднуємо кастомні пропси зі стандартними атрибутами HTML-елемента <input>
export type FormFieldProps = FormFieldCustomProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof FormFieldCustomProps>;

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  touched,
  rightIcon,
  className,
  ...restProps
}) => {
  const hasError = Boolean(touched && error);

  return (
    <div className={styles.FormField}>
      {label && (
        <label htmlFor={name} className={styles.FormField__label}>
          {label}
        </label>
      )}

      <div>
        <input
          id={name}
          name={name}
          className={cn(styles.FormField__input, {
            [styles.FormField__input_error]: hasError,
          })}
          {...restProps}
        />

        {hasError && <p className={styles.FormField__error}>{error}</p>}
      </div>
    </div>
  );
};

export default FormField;
