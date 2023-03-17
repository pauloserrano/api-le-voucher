export default {
  preset: "ts-jest",
  clearMocks: true,
  //collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleDirectories: ["node_modules", "src"],
  testEnvironment: "node",
  testMatch:  ["<rootDir>/tests/**/*.(test|spec).ts"],
  transform: {
    ".+\\.ts$": "ts-jest",
  },
};
