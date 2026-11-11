import styles from "./HoursInput.module.scss";
import { forwardRef } from "react";

interface HoursInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}

const HoursInput = forwardRef<HTMLLabelElement, HoursInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <label className={styles.inputWrapper} onClick={onClick} ref={ref}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        readOnly
        className={styles.inputField}
      />

      <button type="button" className={styles.iconButton}></button>
    </label>
  ),
);

HoursInput.displayName = "CustomInput";

export default HoursInput;
