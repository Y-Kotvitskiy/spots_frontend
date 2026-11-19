import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSelector } from "@/store/hooks";

const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser, isChecked } = useAuthSelector();
  const location = useLocation();

  if (!isChecked) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};

export default RequireAuth;
