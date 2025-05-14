/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/",
    "jest.config.js",
    "jest.setup.js",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/src/domains/*/__tests__/",
  ],
  testMatch: ["**/src/__tests__/**/*.test.[jt]s?(x)"],
};
