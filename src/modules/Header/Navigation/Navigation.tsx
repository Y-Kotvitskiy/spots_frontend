import styles from "./Navigation.module.scss";

const Navigation = () => {
  return (
    <nav>
      <ul className={styles.Navigation__list}>
        <li>
          <a href="/">Map</a>
        </li>
        <li>
          <a href="/groups">Groups</a>
        </li>
        <li>
          <a href="/personal-room">Personal Room</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
