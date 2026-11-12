import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./WorkingHoursPicker.module.scss";
import FormButton from "@/modules/AuthContainer/FormButton";

interface WorkingHoursPickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: string;
  onSelect: (timeRange: string) => void;
}

const ITEM_HEIGHT = 40;

const WorkingHoursPicker: React.FC<WorkingHoursPickerProps> = ({
  isOpen,
  onClose,
  initialValue = "08:00-20:00",
  onSelect,
}) => {
  const [start, end] = initialValue.split("-");
  const [startH, startM] = (start || "08:00").split(":");
  const [endH, endM] = (end || "20:00").split(":");

  const [startHour, setStartHour] = React.useState(startH || "08");
  const [startMinute, setStartMinute] = React.useState(startM || "00");
  const [endHour, setEndHour] = React.useState(endH || "20");
  const [endMinute, setEndMinute] = React.useState(endM || "00");

  const startHRef = useRef<HTMLDivElement>(null);
  const startMRef = useRef<HTMLDivElement>(null);
  const endHRef = useRef<HTMLDivElement>(null);
  const endMRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToValue(startHRef, hours, startHour);
        scrollToValue(startMRef, minutes, startMinute);
        scrollToValue(endHRef, hours, endHour);
        scrollToValue(endMRef, minutes, endMinute);
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const scrollToValue = (ref: React.RefObject<HTMLDivElement | null>, items: string[], value: string) => {
    if (!ref.current) return;
    const index = items.indexOf(value);
    if (index !== -1) {
      ref.current.scrollTop = index * ITEM_HEIGHT;
    }
  };

  const handleScrollEnd = (
    ref: React.RefObject<HTMLDivElement | null>,
    items: string[],
    setValue: (val: string) => void
  ) => {
    if (!ref.current) return;
    const index = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    setValue(items[clampedIndex]);
  };

  const handlePick = () => {
    const timeRange = `${startHour}:${startMinute}-${endHour}:${endMinute}`;
    onSelect(timeRange);
    onClose();
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Select working hours</h3>
        </div>

        <div className={styles.pickerContainer}>
          {/* Колонка 1: Години початку */}
          <div
            className={styles.column}
            ref={startHRef}
            onScroll={() => handleScrollEnd(startHRef, hours, setStartHour)}
          >
            <div className={styles.scrollList}>
              {hours.map((h) => (
                <div key={`sh-${h}`} className={`${styles.item} ${startHour === h ? styles.active : ""}`}>
                  {h}
                </div>
              ))}
            </div>
          </div>

          <span className={styles.separator}>:</span>

          {/* Колонка 2: Хвилини початку */}
          <div
            className={styles.column}
            ref={startMRef}
            onScroll={() => handleScrollEnd(startMRef, minutes, setStartMinute)}
          >
            <div className={styles.scrollList}>
              {minutes.map((m) => (
                <div key={`sm-${m}`} className={`${styles.item} ${startMinute === m ? styles.active : ""}`}>
                  {m}
                </div>
              ))}
            </div>
          </div>

          <span className={styles.dash}>—</span>

          {/* Колонка 3: Години кінця */}
          <div
            className={styles.column}
            ref={endHRef}
            onScroll={() => handleScrollEnd(endHRef, hours, setEndHour)}
          >
            <div className={styles.scrollList}>
              {hours.map((h) => (
                <div key={`eh-${h}`} className={`${styles.item} ${endHour === h ? styles.active : ""}`}>
                  {h}
                </div>
              ))}
            </div>
          </div>

          <span className={styles.separator}>:</span>

          {/* Колонка 4: Хвилини кінця */}
          <div
            className={styles.column}
            ref={endMRef}
            onScroll={() => handleScrollEnd(endMRef, minutes, setEndMinute)}
          >
            <div className={styles.scrollList}>
              {minutes.map((m) => (
                <div key={`em-${m}`} className={`${styles.item} ${endMinute === m ? styles.active : ""}`}>
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <FormButton type="button" text="Pick" onClick={handlePick} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WorkingHoursPicker;