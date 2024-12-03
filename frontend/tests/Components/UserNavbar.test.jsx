import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import UserNavbar from "../../src/components/UserNavbar/UserNavbar";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

jest.mock("../../src/envConfig", () => ({
    envConfig: () => "test",
}));

beforeEach(() => {
    axios.post.mockClear();
});

test("renders UserNavbar with links", () => {
    render(
        <Router>
            <UserNavbar />
        </Router>
    );

    // Verify the presence of navigation links
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Model Tester")).toBeInTheDocument();
    expect(screen.getByText("Change Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Logout/i })).toBeInTheDocument();
});

test("logs out successfully when logout button is clicked", async () => {
    axios.post.mockResolvedValueOnce({
        data: { error: false, message: "Logged out successfully" },
    });

    render(
        <Router>
            <UserNavbar />
        </Router>
    );

    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("test/logout");
    });
});

test("handles logout failure correctly", async () => {
    axios.post.mockResolvedValueOnce({
        data: { error: true, message: "Logout failed" },
    });

    render(
        <Router>
            <UserNavbar />
        </Router>
    );

    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    fireEvent.click(logoutButton);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("Logout failed:", "Logout failed");
    });
    consoleErrorSpy.mockRestore();
});

test("handles logout error correctly (catch block)", async () => {
    // Mock axios.post to reject with an error
    axios.post.mockRejectedValueOnce(new Error("Logout failed"));

    render(
        <Router>
            <UserNavbar />
        </Router>
    );

    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    fireEvent.click(logoutButton);

    // Spy on console.error to check if it's called with the correct error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await waitFor(() => {
        // Verify the error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error during logout:", expect.any(Error));
    });

    // Clean up the spy
    consoleErrorSpy.mockRestore();
});
