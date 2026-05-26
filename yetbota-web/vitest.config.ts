import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: false,
    clearMocks: true,
    restoreMocks: true,
    // The base APIs read these at module load to build absolute base URLs.
    // Setting them here lets MSW intercept requests at http://localhost/v1.
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost",
      NEXT_PUBLIC_CONTENT_API_BASE_URL: "http://localhost",
    },
  },
});
