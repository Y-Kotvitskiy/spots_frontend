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

  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://79.76.43.137",
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
});
