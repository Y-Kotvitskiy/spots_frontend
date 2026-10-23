import styles from "./Navigation.module.scss";

import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../../components/AuthContext.tsx";
import cn from "classnames";
import Icon from "../../shared/Icon";

const Navigation = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isAuthPages = isLoginPage || isRegisterPage;

  const activeItemClass = (isActive: boolean) => {
    return cn(styles.Navigation__item, {
      [styles.Navigation__item_active]: isActive,
      [styles.Navigation__item_login]: isAuthPages,
    });
  };

  return (
    <nav className={styles.Navigation}>
      <ul className={styles.Navigation__list}>
        {currentUser ? (
          <>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => activeItemClass(isActive)}
              >
                <Icon
                  name="map"
                  className={styles.Navigation__icon}
                  size={22}
                />
                <span className={styles.Navigation__text}>Map</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/groups"
                className={({ isActive }) => activeItemClass(isActive)}
              >
                <Icon
                  name="group"
                  className={styles.Navigation__icon}
                  size={22}
                />
                <span className={styles.Navigation__text}>Groups</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/personal-room"
                className={({ isActive }) => activeItemClass(isActive)}
              >
                <Icon
                  name="home"
                  className={styles.Navigation__icon}
                  size={22}
                />
                <span className={styles.Navigation__text}>Personal Room</span>
              </NavLink>
            </li>
          </>
        ) : (
          <>
            {isLoginPage && (
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) => activeItemClass(isActive)}
                >
                  <span className={styles.Navigation__text}>Register</span>
                </NavLink>
              </li>
            )}
            {isRegisterPage && (
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) => activeItemClass(isActive)}
                >
                  <span className={styles.Navigation__text}>Login</span>
                </NavLink>
              </li>
            )}
            {!isLoginPage && !isRegisterPage && (
              <>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => activeItemClass(isActive)}
                  >
                    <span className={styles.Navigation__text}>Login</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    className={({ isActive }) => activeItemClass(isActive)}
                  >
                    <span className={styles.Navigation__text}>Register</span>
                  </NavLink>
                </li>
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
