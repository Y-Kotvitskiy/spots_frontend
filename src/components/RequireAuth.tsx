import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loader from "../modules/shared/Loader";

const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const { isChecked, currentUser } = useAuth();
  const location = useLocation();

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
