import styles from "./Header.module.scss";
import cn from "classnames";
import Navigation from "./Navigation/Navigation";
import { NavLink } from "react-router-dom";
import Logo from "../shared/Logo";
import { useAuthSelector } from "@/store/hooks";

const Header = () => {
  const { currentUser } = useAuthSelector();

  return (
    <header
      className={cn(styles.Header, {
        [styles.Header_loginPage]: !currentUser,
      })}
    >
      <NavLink to="/" className={styles.Header__logo}>
        <Logo />
      </NavLink>
      <Navigation />
    </header>
  );
};

export default Header;
