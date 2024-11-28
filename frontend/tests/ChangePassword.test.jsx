// ChangePassword.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChangePassword from "../src/pages/ChangePassword/ChangePassword";

// Mock swal
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

test("renders ChangePassword component", () => {
  render(<ChangePassword />);

  // Verify the presence of the input fields and submit button
  const oldPasswordInput = screen.getByLabelText(/Enter Old Password/i);
  const newPasswordInput = screen.getByLabelText(/Enter New Password/i);
  const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
  const submitButton = screen.getByText(/Change Password/i);

  expect(oldPasswordInput).toBeInTheDocument();
  expect(newPasswordInput).toBeInTheDocument();
  expect(confirmPasswordInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});

test("shows error message when passwords do not match", () => {
  render(<ChangePassword />);

  const oldPasswordInput = screen.getByLabelText(/Enter Old Password/i);
  const newPasswordInput = screen.getByLabelText(/Enter New Password/i);
  const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
  const submitButton = screen.getByText(/Change Password/i);

  fireEvent.change(oldPasswordInput, { target: { value: "oldpassword" } });
  fireEvent.change(newPasswordInput, { target: { value: "newpassword" } });
  fireEvent.change(confirmPasswordInput, {
    target: { value: "differentpassword" },
  });

  fireEvent.click(submitButton);

  // Check for the error message
  expect(swal.fire).toHaveBeenCalledWith({
    icon: "error",
    title: "Passwords do not match",
  });
});

test("resets form and shows success message when form is valid", async () => {
  render(<ChangePassword />);

  const oldPasswordInput = screen.getByLabelText(/Enter Old Password/i);
  const newPasswordInput = screen.getByLabelText(/Enter New Password/i);
  const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
  const submitButton = screen.getByText(/Change Password/i);

  fireEvent.change(oldPasswordInput, { target: { value: "oldpassword" } });
  fireEvent.change(newPasswordInput, { target: { value: "newpassword" } });
  fireEvent.change(confirmPasswordInput, { target: { value: "newpassword" } });

  // Mock fetch response to prevent actual network call
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          error: false,
          message: "Password changed successfully!",
        }),
    })
  );

  fireEvent.click(submitButton);

  // Check for the success message and reset form
  await screen.findByText("Password changed successfully!");
  expect(swal.fire).toHaveBeenCalledWith({
    icon: "success",
    title: "Password changed successfully!",
    timer: 1500,
  });

  // Ensure form is reset
  expect(oldPasswordInput.value).toBe("");
  expect(newPasswordInput.value).toBe("");
  expect(confirmPasswordInput.value).toBe("");
});
