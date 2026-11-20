import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSelector } from "@/store/hooks";
import Welcome from "@/modules/AuthContainer/Welcome";

const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser, isChecked } = useAuthSelector();
  const location = useLocation();

  if (!isChecked) {
    return null;
  }

  if (!currentUser) {
    if (location.pathname !== "/") {
      return <Navigate to="/" replace state={{ from: location }} />;
    }
    return <Welcome />;
  }

  return children ?? <Outlet />;
};

export default RequireAuth;
