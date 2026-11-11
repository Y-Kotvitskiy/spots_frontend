import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../modules/shared/Loader";
import { useAuthSelector, useAppDispatch } from "@/store/hooks";
import { authActions } from "@/store";
import { useEffect } from "react";

const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const { isChecked, currentUser } = useAuthSelector();
  const location = useLocation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isChecked) {
      dispatch(authActions.checkAuth());
    }
  }, [dispatch, isChecked]);

  if (!isChecked) {
    return <Loader />;
  }

  if (!currentUser) {
    console.log("RequireAuth: redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};

export default RequireAuth;
