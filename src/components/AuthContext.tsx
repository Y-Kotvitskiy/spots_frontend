import React, { useEffect, useMemo, useState } from "react";
import { accessTokenService } from "../services/accessTokenService";
import { authService } from "../services/authService";

import type { User } from "../types/user";

/* eslint-disable @typescript-eslint/no-unused-vars */
const AuthContext = React.createContext({
  isChecked: false,
  currentUser: null as User | null,
  updateUser: (_newData: Partial<User>) => {},
  checkAuth: async () => {},
  activate: async (_token: string) => {},
  login: async (_email: string, _password: string) => {},
  logout: async () => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars */

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isChecked, setChecked] = useState(false);

  async function activate(token: string) {
    const { accessToken, user } = await authService.activate(token);

    accessTokenService.save(accessToken);
    setCurrentUser(user);
  }

  async function checkAuth() {
    try {
      const { accessToken, user } = await authService.refresh();
      accessTokenService.save(accessToken);
      setCurrentUser(user);
    } catch (error) {
      console.log("User is not authenticated");
    } finally {
      setChecked(true);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(email: string, password: string) {
    const { accessToken, user } = await authService.login(email, password);

    accessTokenService.save(accessToken);
    setCurrentUser(user);
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Ошибка при логауте:", error);

      throw error;
    } finally {
      accessTokenService.remove();
      setCurrentUser(null);
    }
  }

  function updateUser(newData: Partial<User>) {
    setCurrentUser(
      (prevValue) =>
        ({
          ...prevValue,
          ...newData,
        }) as User,
    );
  }

  const value = useMemo(
    () => ({
      isChecked,
      currentUser,
      updateUser,
      checkAuth,
      activate,
      login,
      logout,
    }),
    [currentUser, isChecked],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => React.useContext(AuthContext);
export default AuthProvider;
