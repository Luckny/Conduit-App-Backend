/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

// jest.config.ts
import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
   preset: "ts-jest",
   testEnvironment: "node",
   //  verbose: true,
   setupFiles: ["dotenv/config"],
   setupFilesAfterEnv: ["jest-extended/all"],
   collectCoverageFrom: ["src/**/*.ts"],
   coveragePathIgnorePatterns: ["index.ts", "express-flash-plus.d.ts"],
};
export default config;
