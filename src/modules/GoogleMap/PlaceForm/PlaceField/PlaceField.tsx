import styles from "./PlaceField.module.scss";

import React, { useState } from "react";
import cn from "classnames";

export interface FormFieldProps {
  label?: string;
  validate?: (value: string) => string;
  name: string;
  value: string | string[];
  onChange: (e: React.ChangeEvent<any> | string) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  type?: "text" | "textarea" | "selectButtons" | "photo";
  options?: string[];
  className?: string; // Добавили в интерфейс
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  placeholder,
  error,
  touched,
  type,
  options,
  onChange,
  onBlur,
  className,
  required,
}) => {
  const hasError = Boolean(touched && error);

  return (
    <div className={styles.PlaceField}>
      {label && (
        <label htmlFor={name} className={styles.PlaceField__label}>
          {label}
          {required && <span className={styles.PlaceField__required}> *</span>}
        </label>
      )}

      {type === "text" && (
        <input
          id={name}
          name={name}
          type="text"
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          placeholder={placeholder}
          className={cn(styles.PlaceField__input, {
            [styles.PlaceField__input_error]: hasError,
          })}
        />
      )}

      {type === "textarea" && (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}

          className={cn(styles.PlaceField__textarea, {
            [styles.PlaceField__textarea_error]: hasError,
          })}
        />
      )}

      {type === "selectButtons" && (
        <div className={styles.PlaceField__options}>
          {options &&
            options.length > 0 &&
            options.map((option) => {
              const isSelected =
                typeof value === "string"
                  ? value === option
                  : value.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  className={cn(styles.PlaceField__option, {
                    [styles.PlaceField__option_selected]: isSelected,
                  })}
                  onClick={() => onChange(option)}
                >
                  {option}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default FormField;
