const dotenv = require("dotenv");

// Load the environment variables from the .env.test file
dotenv.config({ path: "./.env.test" });

module.exports = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!@babel/.*\\.js$)"],
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
  },
  testTimeout: 30000, // 30 seconds timeout
  maxWorkers: "50%", // Use 50% of the available CPUs
};
