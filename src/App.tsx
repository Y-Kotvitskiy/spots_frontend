import { Outlet } from "react-router-dom";
import "./App.scss";
import "./scss/main.scss";
import Header from "./modules/Header/Header.tsx";
import { fetchInitialData } from "./store/slices/mapSlice";
import { useAppDispatch } from "./store/hooks";
import { useEffect } from "react";

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchInitialData());
    console.log("dispatch(fetchInitialData())");
  }, [dispatch]);

  return (
    <div className="App__container">
      <Header />
      <Outlet />
    </div>
  );
};

export default App;
