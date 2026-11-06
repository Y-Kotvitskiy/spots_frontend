import React, { useRef } from "react";
import styles from "./WorkingHoursPicker.module.scss";
import Button from "@/modules/shared/Button";
import Icon from "@/modules/shared/Icon";

interface WorkingHoursPickerProps {
  onPick: (timeRange: string) => void;
  onClose: () => void;
}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const WorkingHoursPicker: React.FC<WorkingHoursPickerProps> = ({ onPick, onClose }) => {
  const [startHour, setStartHour] = React.useState("18");
  const [startMinute, setStartMinute] = React.useState("00");
  const [endHour, setEndHour] = React.useState("18");
  const [endMinute, setEndMinute] = React.useState("20");

  const handlePick = () => {
    const range = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
    onPick(range);
    onClose();
  };

  const renderColumn = (
    items: string[], 
    selectedItem: string, 
    setSelectedItem: (val: string) => void
  ) => {
    const columnRef = useRef<HTMLDivElement>(null);

    const handleScrollEnd = (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const itemHeight = 36; // Висота одного елемента в пікселях
      const index = Math.round(target.scrollTop / itemHeight);
      if (items[index]) {
        setSelectedItem(items[index]);
      }
    };

    return (
      <div className={styles.wheelWrapper}>
        <div className={styles.selectionHighlight} />
        <div 
          className={styles.scrollColumn} 
          ref={columnRef}
          onScroll={handleScrollEnd}
        >
          <div className={styles.paddingSpacer} />
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className={`${styles.timeItem} ${selectedItem === item ? styles.timeItem_active : ""}`}
              onClick={() => {
                setSelectedItem(item);
                const itemHeight = 36;
                const index = items.indexOf(item);
                columnRef.current?.scrollTo({ top: index * itemHeight, behavior: "smooth" });
              }}
            >
              {item}
            </button>
          ))}
          <div className={styles.paddingSpacer} />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Select working hours</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className={styles.pickerContainer}>
          <div className={styles.columnGroup}>
            {renderColumn(hours, startHour, setStartHour)}
            <span className={styles.separator}>:</span>
            {renderColumn(minutes, startMinute, setStartMinute)}
          </div>

          <span className={styles.dash}>—</span>

          <div className={styles.columnGroup}>
            {renderColumn(hours, endHour, setEndHour)}
            <span className={styles.separator}>:</span>
            {renderColumn(minutes, endMinute, setEndMinute)}
          </div>
        </div>

        <div className={styles.footer}>
          <Button type="button" text="Pick" onClick={handlePick} />
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursPicker;