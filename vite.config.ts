import react from "@vitejs/plugin-react";
import sassDts from "vite-plugin-sass-dts";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sassDts()],
});
