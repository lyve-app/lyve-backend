/** @type {import('ts-jest').JestConfigWithTsJest} */
/* eslint-disable */
export default {
  displayName: "api",
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageDirectory: "coverage",
  modulePathIgnorePatterns: [
    "./dist",
    "./coverage",
    "./logs",
    "./prisma",
    "./assets",
    "./node_modules",
    "index.ts",
    "app.ts",
    "src/validations", // no need for testing validations
    "src/routes",
    "src/config/swagger.ts"
  ],
  coverageReporters: ["json", "html", "text"],
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }]
  },
  moduleFileExtensions: ["ts", "js", "html"],
  setupFilesAfterEnv: ["./src/config/singleton.ts"]
};
