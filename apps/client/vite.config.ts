import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // Proxy to Local NestJS App!
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
