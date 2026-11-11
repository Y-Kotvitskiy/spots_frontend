import { httpClient } from "../http/httpClient";
import type { User } from "../types";

const getAvatarUrl = (avatarId?: string | null): string | null => {
  if (!avatarId) return null;
  if (avatarId.startsWith("http") || avatarId.startsWith("blob:")) {
    return avatarId;
  }
  return `https://spots.pp.ua/api/v2/users/avatars/${avatarId}`;
};

const mapUserResponse = (raw: any): User => {
  const avatarField = raw.avatar_url || raw.avatar || raw.avatarId;

  return {
    id: raw.id,
    name: raw.display_name || raw.name || "",
    email: raw.email || "",
    avatar: getAvatarUrl(avatarField),
  };
};

export const userService = {
  getMe: async (): Promise<User> => {
    const rawUser = await httpClient.get("/users/me");
    return mapUserResponse(rawUser);
  },

  updateMe: async (data: { display_name?: string; email?: string; file?: File }): Promise<User> => {
    const formData = new FormData();
    
    if (data.display_name) {
      formData.append("display_name", data.display_name);
    }
    if (data.email) {
      formData.append("email", data.email);
    }
    if (data.file) {
      formData.append("file", data.file);
    }

    const rawUser = await httpClient.patch("/users/me", formData);
    return mapUserResponse(rawUser);
  },
};