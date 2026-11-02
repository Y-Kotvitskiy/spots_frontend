import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Символ '@' будет указывать на папку 'src'
      "@": `${import.meta.dirname}/src`,
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "https://spots.pp.ua",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
