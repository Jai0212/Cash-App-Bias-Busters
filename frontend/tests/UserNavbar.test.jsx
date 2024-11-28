// UserNavbar.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../src/Components/UserNavbar/UserNavbar";

// Mock axios and useNavigate
jest.mock("axios");
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  axios.post.mockClear();
  mockNavigate.mockClear();
});

test("renders UserNavbar and verifies links", () => {
  render(
    <BrowserRouter>
      <UserNavbar />
    </BrowserRouter>
  );

  // Verify presence of navigation links
  expect(screen.getByText("About Us")).toBeInTheDocument();
  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Model Tester")).toBeInTheDocument();
  expect(screen.getByText("Change Password")).toBeInTheDocument();
});

test("handles logout correctly", async () => {
  axios.post.mockResolvedValue({ data: { error: false } });

  render(
    <BrowserRouter>
      <UserNavbar />
    </BrowserRouter>
  );

  // Click the logout button
  fireEvent.click(screen.getByText("Logout"));

  // Check if axios.post was called correctly
  expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/logout");

  // Simulate successful logout
  await screen.findByText("Logout");
  expect(mockNavigate).toHaveBeenCalledWith("/");
});

test("handles logout error correctly", async () => {
  axios.post.mockResolvedValue({
    data: { error: true, message: "Logout failed" },
  });

  render(
    <BrowserRouter>
      <UserNavbar />
    </BrowserRouter>
  );

  // Click the logout button
  fireEvent.click(screen.getByText("Logout"));

  // Check if axios.post was called correctly
  expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/logout");

  // Simulate logout error
  await screen.findByText("Logout");
  // Ensure navigate is not called on error
  expect(mockNavigate).not.toHaveBeenCalled();
});
