import { httpClient } from "../http/httpClient";
import type { User, ChangeEmail, ChangePassword } from "../types";

export const userService = {
  getAll: (): Promise<User[]> => httpClient.get("/users"),
  getById: (id: number): Promise<User> => httpClient.get(`/users/${id}`),
  patch: (
    id: number,
    data: Partial<User> | ChangePassword | ChangeEmail,
  ): Promise<User> => httpClient.patch(`/users/${id}`, data),
};
