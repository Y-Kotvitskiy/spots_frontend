import React from "react";
import styles from "./Placeholder.module.scss";
import Loader from "@/modules/shared/Loader";

interface PlaceholderProps {
  text: string;
  isLoading?: boolean;
  rows?: number;
  cols?: number;
}

const Placeholder: React.FC<PlaceholderProps> = ({
  text,
  isLoading = false,
  rows = 12,
  cols = 12,
}) => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholder__patternContent}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className={styles.placeholder__patternRow}>
            {[...Array(cols)].map((_, j) => (
              <span key={j}>{text}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Лоадер поверх патерну, якщо зображення ще вантажится */}
      {isLoading && <Loader className={styles.placeholder__loaderOverlay} />}
    </div>
  );
};

export default Placeholder;