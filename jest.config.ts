export default {
  clearMocks: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  coverageProvider: "v8",
  roots: [
    "<rootDir>"
  ],
  transform: {
    "^.+\\.ts$": "ts-jest"
  }
};
