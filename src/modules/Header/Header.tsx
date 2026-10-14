import styles from "./Header.module.scss";
import Navigation from "./Navigation/Navigation";
import { NavLink } from "react-router-dom";
import Logo from "../shared/Logo";

const Header = () => (
  <header className={styles.Header}>
    <NavLink to="/">
      <Logo />
    </NavLink>
    <Navigation />
  </header>
);

export default Header;
