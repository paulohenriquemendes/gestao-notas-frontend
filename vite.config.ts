import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Configura o Vite para desenvolvimento local e build de produção.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
