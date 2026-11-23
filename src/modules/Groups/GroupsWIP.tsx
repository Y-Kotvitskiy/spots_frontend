import React from "react";
import styles from "./GroupsWIP.module.scss";

const Groups: React.FC = () => {
  return (
    <main className={styles.Groups}>
      <div className={styles.container}>
        <section className={styles.wipCard} aria-label="Groups section status">
          <h1 className={styles.wipCard__title}>Work In Progress</h1>
        </section>
      </div>
    </main>
  );
};

export default Groups;