import { Navigate, Outlet } from "react-router-dom";
import { useAuthSelector, useAppDispatch } from "@/store/hooks";
import { authActions } from "@/store";
import { useEffect } from "react";
import Loader from "../modules/shared/Loader";

const PublicOnlyRoute = () => {
  const { isChecked, currentUser } = useAuthSelector();
  const dispatch = useAppDispatch();
  const hasToken = Boolean(localStorage.getItem("accessToken"));

  useEffect(() => {
    if (!isChecked) {
      dispatch(authActions.checkAuth());
    }
  }, [dispatch, isChecked]);

  if (!isChecked) {
    return <Loader />;
  }

  if (hasToken || currentUser) {
    return <Navigate to="/map" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;