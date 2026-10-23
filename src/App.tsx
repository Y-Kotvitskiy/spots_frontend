import { Outlet, useLocation } from "react-router-dom";
import "./App.scss";
import "./scss/main.scss";
import Header from "./modules/Header/Header.tsx";

const App = () => {
  const location = useLocation();

  return (
    <div className="App__container">
      {/* {location.pathname !== "/" &&
        location.pathname.toLocaleLowerCase() !== "/map" && <Header />} */}

      <Header />
      <Outlet />
    </div>
  );
};

export default App;
