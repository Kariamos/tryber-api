// jest.config.js
const { pathsToModuleNameMapper } = require("ts-jest/utils");

const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
    jsonwebtoken: "<rootDir>/src/__mocks__/jsonwebtoken",
    "@appquality/wp-auth": "<rootDir>/src/__mocks__/@appquality-wp-auth",
  }),
  testMatch: [
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 15000,
};
