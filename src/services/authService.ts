import { authClient as client } from "../http/authClient";
import { refreshTokenService } from "./refershTokenService";

interface AuthData {
  access_token: string;
  refresh_token: string;
  display_name: string;
  email: string;
}

interface RefreshData {
  access_token: string;
  refresh_token: string;
}

export const authService = {
  register: (display_name: string, email: string, password: string) => {
    return client.post("/register", { display_name, email, password });
  },

  activate: (token: string): Promise<AuthData> => {
    return client.get(`/activation/${token}`);
  },

  login: (loginEmail: string, password: string): Promise<AuthData> => {
    return client.post("/login", { email: loginEmail, password });
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

  refresh: (): Promise<RefreshData> => {
    const refresh_token = refreshTokenService.get();

    return client.post("/refresh", { refresh_token });
  },
};
