import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/test/**/*.test.ts", "<rootDir>/test/**/*.test.tsx"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/e2e/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/components/ui/**", "!src/generated/**", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  // TODO: Add coverage thresholds once codebase stabilizes
  // coverageThreshold: { global: { branches: 70, functions: 70, lines: 70, statements: 70 } },
};

export default createJestConfig(config);
