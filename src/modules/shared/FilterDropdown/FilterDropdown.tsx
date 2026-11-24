import type { RefObject } from "react";
import styles from "./FilterDropdown.module.scss";
import Icon from "../Icon";

export interface DropdownOption {
  value: string;
  label: string;
  active: boolean;
  checked?: boolean;
}

interface FilterDropdownProps {
  label: string;
  isOpen: boolean;
  wrapperRef: RefObject<HTMLDivElement | null>;
  options: DropdownOption[];
  keepOpenOnSelect?: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}

const FilterDropdown = ({
  label,
  isOpen,
  wrapperRef,
  options,
  keepOpenOnSelect = false,
  onToggle,
  onSelect,
}: FilterDropdownProps) => {
  return (
    <div className={styles.customSelectWrapper} ref={wrapperRef}>
      <button type="button" className={styles.filterSelect} onClick={onToggle}>
        <span>{label}</span>
        <Icon
          name="down"
          size={16}
          className={`${styles.selectArrow} ${
            isOpen ? styles.selectArrow_open : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className={styles.customDropdownMenu}>
          {options.map((option) => (
            <button
              key={`${option.value}_${option.label}`}
              type="button"
              className={`${styles.customDropdownItem} ${
                option.active ? styles.customDropdownItem_active : ""
              }`}
              onClick={(e) => {
                if (keepOpenOnSelect) {
                  e.stopPropagation();
                }
                onSelect(option.value);
              }}
            >
              {option.checked !== undefined && (
                <span className={styles.checkboxIndicator}>
                  {option.checked ? "✓ " : ""}
                </span>
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;