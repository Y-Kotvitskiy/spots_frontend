import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://79.76.43.137",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
