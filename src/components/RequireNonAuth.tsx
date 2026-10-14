import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loader from "../modules/shared/Loader/Loader.tsx";

export const RequireNonAuth = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { isChecked, currentUser } = useAuth();

  if (!isChecked) {
    return <Loader />;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};
