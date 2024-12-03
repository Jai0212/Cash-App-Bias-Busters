import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import UserLogin from "../src/pages/UserLogin/UserLogin";


global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ error: false, message: "Login successful" }),
    })
);

jest.mock("../src/envConfig", () => ({
    envConfig: () => {
        return "test";
    },
}));

beforeEach(() => {
    fetch.mockClear();
});


test("renders UserLogin form", () => {
    render(
        <MemoryRouter>  {/* Wrap with MemoryRouter */}
            <UserLogin />
        </MemoryRouter>
    );

    // Verify the presence of form elements
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
});

test("submits form with valid data", async () => {
    render(
        <MemoryRouter>  {/* Wrap with MemoryRouter */}
            <UserLogin />
        </MemoryRouter>
    );

    await act(async () => {
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    });


    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("test/login"),
        expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
                email: "test@example.com",
                password: "password123",
            }),
            headers: { "Content-Type": "application/json" },
        })
    );
});

test("shows error message on failed login", async () => {
    // Mock fetch to simulate a failed login
    fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ error: true, message: "Invalid credentials" }),
    });

    render(
        <MemoryRouter>  {/* Wrap with MemoryRouter */}
            <UserLogin />
        </MemoryRouter>
    );

    await act(async () => {
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "wrongpassword" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    });

    // Verify that the error message is displayed
    await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
});

test("calls handleLogout if uploadedFiles exist in localStorage", () => {
    localStorage.setItem("uploadedFiles", JSON.stringify(["file1", "file2"]));
    axios.post.mockResolvedValueOnce({ data: { error: false } });

    render(
        <Router>
            <UserLogin />
        </Router>
    );

    expect(axios.post).toHaveBeenCalledWith("test/logout");
    expect(localStorage.getItem("uploadedFiles")).toBeNull(); // Verify that the item is removed
    expect(mockNavigate).toHaveBeenCalledWith("/");
});

test("handles logout failure in handleLogout", async () => {
    localStorage.setItem("uploadedFiles", JSON.stringify(["file1", "file2"]));
    axios.post.mockResolvedValueOnce({ data: { error: true, message: "Logout failed" } });

    render(
        <Router>
            <UserLogin />
        </Router>
    );

    await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Logout failed:", "Logout failed");
    });
});


test("handles logout error in handleLogout", async () => {
    localStorage.setItem("uploadedFiles", JSON.stringify(["file1", "file2"]));
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    render(
        <Router>
            <UserLogin />
        </Router>
    );

    await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Error during logout:", new Error("Network Error"));
    });
});

test("handles fetch failure in handleForm", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network Error"));

    render(
        <Router>
            <UserLogin />
        </Router>
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            "test/login",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "user@example.com", password: "password123" }),
            })
        );
        expect(console.log).toHaveBeenCalledWith(new Error("Network Error"));
    });
});

test("logs error when an exception occurs during logout", async () => {
    localStorage.setItem("uploadedFiles", JSON.stringify(["file1", "file2"]));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock axios to throw an error
    axios.post.mockRejectedValueOnce(new Error("Network error"));

    render(
        <Router>
            <UserLogin />
        </Router>
    );

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("test/logout");
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error during logout:", expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
});

test("calls navigate on successful logout (response.data.error === false)", async () => {
    localStorage.setItem("uploadedFiles", JSON.stringify(["file1", "file2"]));
    axios.post.mockResolvedValueOnce({ data: { error: false } });

    render(
        <Router>
            <UserLogin />
        </Router>
    );

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("test/logout");
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });
});

test('handles form validation errors', async () => {
    render(
        <MemoryRouter>
            <UserLogin />
        </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
        const errorMessages = screen.getAllByText("This field is required");

        expect(errorMessages).toHaveLength(2);
        expect(errorMessages[0]).toBeInTheDocument();
        expect(errorMessages[1]).toBeInTheDocument();
    });
});
