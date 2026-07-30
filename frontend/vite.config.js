import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// L3o AI — Vite config
// Created by Leon Mapelera 🇲🇼
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    outDir: "dist",
  },
});
