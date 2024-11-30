// ChangePassword.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChangePassword from "../src/pages/ChangePassword/ChangePassword";
import { envConfig } from "../src/envConfig";

jest.mock("../src/envConfig", () => ({
  envConfig: () => {
    return "test";
  },
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

  fireEvent.change(screen.getByLabelText("Enter Old Password"), {
    target: { value: "oldpassword123" },
  });
  fireEvent.change(screen.getByLabelText("Enter New Password"), {
    target: { value: "newpassword123" },
  });
  fireEvent.change(screen.getByLabelText("Confirm Password"), {
    target: { value: "newpassword123" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));
});
