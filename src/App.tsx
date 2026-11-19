import { Outlet } from "react-router-dom";
import "./App.scss";
import "./scss/main.scss";
import Header from "./modules/Header/Header.tsx";
import { useAppDispatch, useAuthSelector } from "./store/hooks";
import { useEffect } from "react";
import { authActions } from "./store";
import Loader from "./modules/shared/Loader";

const App = () => {
  const { isChecked } = useAuthSelector();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isChecked) {
      dispatch(authActions.checkAuth());
    }
  }, [dispatch, isChecked]);

  return (
    <div className="App__container">
      <Header />

      {isChecked ? <Outlet /> : <Loader />}
    </div>
  );
};

export default App;
