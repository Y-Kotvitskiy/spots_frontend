import { Outlet } from "react-router-dom";
import styles from "./AuthContainer.module.scss";

const AuthContainer = () => {
  return (
    <main className={styles.AuthContainer + " .container"}>
      <section className={styles.AuthContainer__wrapper}>
        <div className={styles.AuthContainer__form}>
          <Outlet />
        </div>

        <img
          className={styles.AuthContainer__photo}
          alt="Registration Photo"
          src="/registration.png"
        />
      </section>
    </main>
  );
};

export default AuthContainer;
