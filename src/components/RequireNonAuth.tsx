import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "../modules/shared/Loader/Loader.tsx";
import { useAuthSelector } from "@/store/hooks";

export const RequireNonAuth = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { isChecked, currentUser } = useAuthSelector();

  if (!isChecked) {
    return <Loader />;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};
