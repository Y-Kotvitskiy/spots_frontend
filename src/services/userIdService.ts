const key = "userId";

export const userIdService = {
  get: () => localStorage.getItem(key),
  save: (id: string) => localStorage.setItem(key, id),
  remove: () => localStorage.removeItem(key),
};