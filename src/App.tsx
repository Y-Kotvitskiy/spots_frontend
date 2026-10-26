import { Outlet } from "react-router-dom";
import "./App.scss";
import "./scss/main.scss";
import Header from "./modules/Header/Header.tsx";

const App = () => {
  return (
    <div className="App__container">
      <Header />
      <Outlet />
    </div>
  );
};

export default App;
