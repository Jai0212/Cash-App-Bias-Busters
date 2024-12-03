import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import ChangePassword from "../src/pages/ChangePassword/ChangePassword";
import Swal from "sweetalert2";

// Mock Swal
jest.mock("sweetalert2");

// Mock the envConfig to return a test URL
jest.mock("../src/envConfig", () => ({
    envConfig: () => "test",
}));

// Mock the global fetch function
global.fetch = jest.fn();

beforeEach(() => {
    fetch.mockClear();
    Swal.fire.mockClear();
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

test("handles successful password change", async () => {
    const mockResponse = { error: false, message: "Password changed successfully" };
    fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockResponse }),
    });

    render(<ChangePassword />);

    fireEvent.change(screen.getByLabelText("Enter Old Password"), { target: { value: "old_password" } });
    fireEvent.change(screen.getByLabelText("Enter New Password"), { target: { value: "new_password" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "new_password" } });

    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));

    await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith({
            icon: "success",
            title: "Password changed successfully",
            timer: 1500,
        });
    });
});

test("handles password change failure", async () => {
    const mockResponse = { error: true, message: "Password change failed" };
    fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockResponse }),
    });

    render(<ChangePassword />);

    fireEvent.change(screen.getByLabelText("Enter Old Password"), { target: { value: "old_password" } });
    fireEvent.change(screen.getByLabelText("Enter New Password"), { target: { value: "new_password" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "new_password" } });

    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));

    await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith({
            icon: "error",
            title: "Password change failed",
        });
    });
});

test("handles fetch error correctly (catch block - line 32)", async () => {
    fetch.mockRejectedValueOnce(new Error("Network Error"));

    render(<ChangePassword />);

    fireEvent.change(screen.getByLabelText("Enter Old Password"), { target: { value: "old_password" } });
    fireEvent.change(screen.getByLabelText("Enter New Password"), { target: { value: "new_password" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "new_password" } });

    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));

    // Wait for the fetch request to complete
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("test/change_password", expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: expect.any(String),
        }));
    });

    // Check that the error is logged (if you need to check the console or catch block behavior)
    expect(console.log).toHaveBeenCalledWith(new Error("Network Error"));

    // This ensures the error handling in the catch block is executed
    // You can add a mock for console.log or error to check behavior
});

test("handles unsuccessful fetch response (error in response - lines 72-106)", async () => {
    // Simulate a failure response with error = true
    const mockResponse = { error: true, message: "Password change failed" };
    fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockResponse }),
    });

    render(<ChangePassword />);

    fireEvent.change(screen.getByLabelText("Enter Old Password"), { target: { value: "old_password" } });
    fireEvent.change(screen.getByLabelText("Enter New Password"), { target: { value: "new_password" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "new_password" } });

    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));

    // Ensure Swal.fire was called for failure response
    await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith({
            icon: "error",
            title: "Password change failed",
        });
    });
});
