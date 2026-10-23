import { useState } from "react";
import styles from "./Controls.module.scss";
import { Link } from "react-router-dom";

const Controls = () => {
  return (
    <aside className={styles.Controls}>
      <Link className={styles.Controls__brand} to={"/"}>
        <img src="/logo_mobile.svg" />
      </Link>
      <input className={styles.Controls__input} placeholder="search" />
      <button className={styles.Controls__filter}>F</button>
      <button className={styles.Controls__addButton}>A </button>
    </aside>
  );
};

export default Controls;
