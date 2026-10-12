import { Outlet } from "react-router-dom";
import "./App.scss";
import "./scss/main.scss";
import Header from "./modules/Header/Header.tsx";
import Footer from "./modules/Footer/Footer.tsx";

const App = () => {
  return (
    <div className="App__container">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;
