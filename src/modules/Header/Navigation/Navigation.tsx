import { NavLink } from "react-router-dom";
import { useAuth } from "../../../components/AuthContext.tsx";
import styles from "./Navigation.module.scss";

const Navigation = () => {
  const { currentUser } = useAuth();

  const activeItemClass = (isActive: boolean) => {
    return (
      `${styles.Navigation__item} ` +
      (isActive ? `${styles.Navigation__item_active}` : "")
    );
  };

  return (
    <nav>
      <ul className={styles.Navigation__list}>
        {currentUser ? (
          <>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => activeItemClass(isActive)}
              >
                Map
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/groups"
                className={({ isActive }) => activeItemClass(isActive)}
              >
                Groups
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/personal-room"
                className={({ isActive }) => activeItemClass(isActive)}
              >
                Personal Room
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
