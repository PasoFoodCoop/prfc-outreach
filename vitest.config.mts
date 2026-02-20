import nextEnv from "@next/env";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

nextEnv.loadEnvConfig(process.cwd());

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/components/ui/**", "src/generated/**"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: [
            "test/services/**",
            "test/actions/**",
            "test/api/**",
            "test/auth/**",
            "test/lib/**",
            "test/utils/errors.test.ts",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
          exclude: [
            "test/services/**",
            "test/actions/**",
            "test/api/**",
            "test/auth/**",
            "test/lib/**",
            "test/utils/errors.test.ts",
          ],
        },
      },
    ],
  },
});
