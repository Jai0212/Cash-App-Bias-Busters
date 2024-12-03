// App.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../../src/App/App";
import { envConfig } from "../../src/envConfig";

// Mocking the environment variable
jest.mock("../../src/envConfig", () => ({
  envConfig: () => "https://cash-app-bias-busters.onrender.com",
  envConfigFrontend: () => "http://localhost:5173",
}));

const VITE_BACKEND_URL = envConfig();

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(ui, { wrapper: BrowserRouter });
};

// test("renders login page at default route", () => {
//   renderWithRouter(<App VITE_BACKEND_URL={VITE_BACKEND_URL} />);
//   expect(screen.getByText(/user login/i)).toBeInTheDocument();
// });

// test("renders signup page at /signup route", () => {
//   renderWithRouter(<App VITE_BACKEND_URL={VITE_BACKEND_URL} />, {
//     route: "/signup",
//   });
//   expect(screen.getByTestId("User Sign Up")).toBeInTheDocument();
// });

// test("renders dashboard page at /dashboard route", () => {
//   renderWithRouter(<App VITE_BACKEND_URL={VITE_BACKEND_URL} />, {
//     route: "/dashboard",
//   });
//   expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
// });

// test("renders change password page at /change-password route", () => {
//   renderWithRouter(<App VITE_BACKEND_URL={VITE_BACKEND_URL} />, {
//     route: "/change-password",
//   });
//   expect(screen.getByTestId("Change Password")).toBeInTheDocument();
// });

// test("renders about page at /about route", () => {
//   renderWithRouter(<App VITE_BACKEND_URL={VITE_BACKEND_URL} />, {
//     route: "/about",
//   });
//   expect(screen.getByTestId("about")).toBeInTheDocument();
// });
