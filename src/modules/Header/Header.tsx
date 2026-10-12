import styles from "./Header.module.scss";
import Logo from "../../shared/Logo";
import Navigation from "./Navigation/Navigation";
import { NavLink } from "react-router-dom";

const Header = () => (
  <header className={styles.Header}>
    <NavLink to="/">
      <Logo />
    </NavLink>
    <Navigation />
  </header>
);

export default Header;
