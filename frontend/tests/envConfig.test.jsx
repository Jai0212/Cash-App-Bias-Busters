// envConfig.test.js
import { envConfig, envConfigFrontend } from "../src/envConfig";
jest.mock("../src/envConfig", () => ({
  envConfig: () => "https://cash-app-bias-busters.onrender.com",
  envConfigFrontend: () => "http://localhost:5173",
}));
describe("envConfig", () => {
  it("should return the backend URL from environment variables", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      VITE_BACKEND_URL: "https://cash-app-bias-busters.onrender.com",
    };
    const backendUrl = envConfig();
    expect(backendUrl).toBe("https://cash-app-bias-busters.onrender.com");
    process.env = originalEnv; // Restore original environment variables
  });
});
describe("envConfigFrontend", () => {
  it("should return the frontend URL from environment variables", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      VITE_FRONTEND_URL: "http://localhost:5173",
    };
    const frontendUrl = envConfigFrontend();
    expect(frontendUrl).toBe("http://localhost:5173");
    process.env = originalEnv; // Restore original environment variables
  });
});
