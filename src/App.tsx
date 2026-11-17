import { Outlet, useLocation } from "react-router-dom";
import "./App.scss";
import "./scss/main.scss";
import Header from "./modules/Header/Header.tsx";

const App = () => {
  const location = useLocation();

  return (
    <div className="App__container">
      <Header />
      <div className="Page" key={location.pathname}>
        <Outlet />
      </div>
    </div>
  );
};

export default App;