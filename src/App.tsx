import { Outlet } from "react-router-dom";
import "./App.scss";
import "./scss/main.scss";
import Header from "./modules/Header/Header.tsx";
import { fetchInitialData } from "./store/slices/mapSlice";
import { useAppDispatch, useMapSelector } from "./store/hooks";
import { useEffect } from "react";

const App = () => {
  const dispatch = useAppDispatch();
  const { status } = useMapSelector();

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  if (status === "loading") {
    return <div>Загрузка карты и мест...</div>;
  }

  return (
    <div className="App__container">
      <Header />
      <Outlet />
    </div>
  );
};

export default App;
