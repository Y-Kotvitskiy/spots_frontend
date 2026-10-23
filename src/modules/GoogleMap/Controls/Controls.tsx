import { useState } from "react";
import styles from "./Controls.module.scss";

const Controls = () => {
  const [showButton, setShowButton] = useState(false);

  return (
    <aside className={styles.Controls}>
      <input className={styles.Controls__input} placeholder="search" />
      <button className={styles.Controls__input}>filter</button>
      <button className={styles.Controls__input}>Add </button>
    </aside>
  );
};

export default Controls;
