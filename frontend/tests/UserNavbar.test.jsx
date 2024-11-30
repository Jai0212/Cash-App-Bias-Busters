// ChangePassword.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChangePassword from "../src/pages/ChangePassword/ChangePassword";

// Mock the envConfig module
jest.mock("../src/utils/envConfig", () => ({
  VITE_BACKEND_URL: "http://localhost:5000", // Provide a mock URL
}));

test("renders ChangePassword form", () => {
  render(<ChangePassword />);

  // Verify the presence of form elements
  expect(screen.getByLabelText("Enter Old Password")).toBeInTheDocument();
  expect(screen.getByLabelText("Enter New Password")).toBeInTheDocument();
  expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Change Password/i })
  ).toBeInTheDocument();
});

test("submits form with valid data", async () => {
  render(<ChangePassword />);

  // Simulate user typing into the form fields
  fireEvent.change(screen.getByLabelText("Enter Old Password"), {
    target: { value: "oldpassword123" },
  });
  fireEvent.change(screen.getByLabelText("Enter New Password"), {
    target: { value: "newpassword123" },
  });
  fireEvent.change(screen.getByLabelText("Confirm Password"), {
    target: { value: "newpassword123" },
  });

  // Simulate form submission
  fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));

  // Assert form submission without errors
  // Optionally mock swal to test success/error messages
});
