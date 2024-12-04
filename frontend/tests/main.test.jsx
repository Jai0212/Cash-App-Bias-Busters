// index.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../src/App/App";

// Mocking the environment variable
jest.mock("../src/envConfig", () => ({
  envConfig: () => "https://cash-app-bias-busters.onrender.com",
  envConfigFrontend: () => "http://localhost:5173",
}));

test("renders App component without crashing", () => {
  render(<App />);

  // You can add more specific assertions here if needed
  expect(screen.getByTestId("login-button")).toBeInTheDocument(); // Example assertion for login page text
});
