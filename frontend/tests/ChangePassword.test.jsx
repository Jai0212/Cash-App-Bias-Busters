import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import ChangePassword from "../src/pages/ChangePassword/ChangePassword";

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ success: true }), // Mock response from the server
    })
);

jest.mock("../src/envConfig", () => ({
    envConfig: () => "test",
}));

beforeEach(() => {
    fetch.mockClear(); // Clear previous mock calls before each test
});

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

    // Act on form data
    await act(async () => {
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

    // Check if fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("test/change_password"), // Ensure URL contains 'test/change_password'
        expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
                old_password: "oldpassword123",
                new_password: "newpassword123",
                confirm_password: "newpassword123",
            }),
            headers: { "Content-Type": "application/json" },
        })
    );
});

