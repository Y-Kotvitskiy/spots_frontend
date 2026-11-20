import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(() => {
  const useMockMap = process.env.VITE_MOCK_MAP === "true";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Символ '@' будет указывать на папку 'src'

        "@": `${import.meta.dirname}/src`,

        ...(useMockMap
          ? {
              "@vis.gl/react-google-maps": path.resolve(
                import.meta.dirname,
                "src/mocks/visgl-react-google-maps.tsx",
              ),
            }
          : {}),
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
  };
});
