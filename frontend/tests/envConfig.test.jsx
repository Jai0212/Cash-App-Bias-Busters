import { envConfig, envConfigFrontend } from "../src/envConfig"; // adjust path as necessary

describe("envConfig", () => {
  beforeAll(() => {
    // Mock the values of import.meta.env
    globalThis.import = { meta: { env: { VITE_BACKEND_URL: "http://mock-backend-url.com", VITE_FRONTEND_URL: "http://mock-frontend-url.com" } } };
  });

  afterAll(() => {
    // Clean up after tests to avoid affecting other tests
    delete globalThis.import.meta.env;
  });

  test("envConfig returns correct backend URL", () => {
    expect(envConfig()).toBe("http://mock-backend-url.com");
  });

  test("envConfigFrontend returns correct frontend URL", () => {
    expect(envConfigFrontend()).toBe("http://mock-frontend-url.com");
  });
});
