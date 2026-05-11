import path from "node:path";
import { defineConfig } from "vitest/config";

const __dirname = import.meta.dirname;
const resolvePath = (target) => path.resolve(__dirname, target);

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
      exclude: [
        "node_modules/**",
        "tests/**",
        "**/*.config.js",
        "**/*.test.js",
      ],
    },
  },
  resolve: {
    alias: {
      "#db": resolvePath("db"),
      "#configs": resolvePath("configs"),
      "#constants": resolvePath("constants"),
      "#controllers": resolvePath("controllers"),
      "#data": resolvePath("data"),
      "#repositories": resolvePath("repositories"),
      "#routes": resolvePath("routes"),
      "#schemas": resolvePath("schemas"),
      "#src": resolvePath("src"),
      "#state": resolvePath("state"),
      "#utils": resolvePath("utils"),
    },
  },
});
