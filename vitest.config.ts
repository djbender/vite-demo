import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["app/lib/**/*.ts", "app/routes/**/*.ts"],
      exclude: ["app/lib/**/*.test.ts"],
      reporter: ["text", "html"],
    },
  },
});
