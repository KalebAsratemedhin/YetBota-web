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
    // Base URLs are hardcoded to same-origin /proxy/* prefixes (not read from
    // env). tests/setup.ts resolves those relative paths against http://localhost
    // so MSW can intercept them (handlers use http://localhost/proxy/...).
  },
});
