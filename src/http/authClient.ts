import axios from "axios";

// this client does not have auth interceptors
export const authClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
  withCredentials: true,
});

console.log("authClient baseURL", authClient.defaults.baseURL);

// to awoid getting `res.data` everywhere
authClient.interceptors.response.use((res) => {
  // Якщо статус 204 — явно задаємо res.data як null
  if (res.status === 204) {
    res.data = null;
  }

  // Повертаємо res.data
  return res.data;
});
