const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  clearMocks: true,

  transform: {
    ...tsJestTransformCfg,
  },

  // Only run tests we put under src/__tests__
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],

  // Don't accidentally pick up built JS
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};
