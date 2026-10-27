import styles from "./PlaceField.module.scss";

import cn from "classnames";
import type { Category, Tag } from "@/types/";

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
  options?: typeof Category | typeof Tag;
  className?: string;
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
            Object.entries(options).map(([key, optionValue]) => {
              const isSelected =
                typeof value === "string" ? value === key : value.includes(key);

              return (
                <button
                  key={key}
                  type="button"
                  className={cn(styles.PlaceField__option, {
                    [styles.PlaceField__option_selected]: isSelected,
                  })}
                  onClick={() => onChange(key)}
                >
                  {optionValue}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default FormField;
