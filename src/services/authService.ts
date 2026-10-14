import { authClient as client } from "../http/authClient";
import type { User } from "../types/user";

interface AuthData {
  accessToken: string;
  user: User;
}

export const authService = {
  register: (name: string, email: string, password: string) => {
    return client.post("/registration", { name, email, password });
  },

  activate: (token: string): Promise<AuthData> => {
    return client.get(`/activation/${token}`);
  },

  login: (email: string, password: string): Promise<AuthData> => {
    return client.post("/login", { email, password });
  },

  logout: () => {
    const accessToken = localStorage.getItem("accessToken");

    return client.post("/logout", null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  forgotPasswordRequest: (email: string): Promise<{ message: string }> =>
    client.post("/forgot-password-request", { email }),

  resetPassword: (
    newPassword: string,
    jwt: string,
  ): Promise<{ message: string }> =>
    client.post("/reset-password", { newPassword, jwt }),

  refresh: (): Promise<AuthData> =>
    client.get("/refresh", {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }),
};
