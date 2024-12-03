import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter
import UserSignup from "../src/pages/UserSignup/UserSignup";

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ error: false, message: "Signup successful" }),
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

test("calls handleLogout if uploadedFiles exist in localStorage", async () => {
    // Mock localStorage with uploadedFiles
    localStorage.setItem("uploadedFiles", JSON.stringify(["file1", "file2"]));

    const mockLogout = jest.spyOn(Storage.prototype, "removeItem");
    const mockNavigate = jest.fn();

    jest.mock("react-router-dom", () => ({
        ...jest.requireActual("react-router-dom"),
        useNavigate: () => mockNavigate,
    }));

    render(
        <MemoryRouter>
            <UserSignup />
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledWith("uploadedFiles");
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    mockLogout.mockRestore();
});

test("navigates to '/' on successful logout", async () => {
    jest.spyOn(axios, "post").mockResolvedValueOnce({
        data: { error: false },
    });

    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
        ...jest.requireActual("react-router-dom"),
        useNavigate: () => mockNavigate,
    }));

    render(
        <MemoryRouter>
            <UserSignup />
        </MemoryRouter>
    );

    // Trigger handleLogout
    fireEvent.submit(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
    axios.post.mockRestore();
});

test("logs an error message on failed logout", async () => {
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(axios, "post").mockResolvedValueOnce({
        data: { error: true, message: "Logout failed" },
    });

    render(
        <MemoryRouter>
            <UserSignup />
        </MemoryRouter>
    );

    fireEvent.submit(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() =>
        expect(consoleErrorMock).toHaveBeenCalledWith(
            "Logout failed:",
            "Logout failed"
        )
    );

    consoleErrorMock.mockRestore();
    axios.post.mockRestore();
});

test("handles unexpected API error during signup", async () => {
    fetch.mockRejectedValueOnce(new Error("Unexpected API Error"));

    render(
        <MemoryRouter>
            <UserSignup />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
        expect(screen.getByText("Unexpected API Error")).toBeInTheDocument();
    });
});

// Test case for rendering the form
test("renders UserSignup form", () => {
    render(
        <MemoryRouter>  {/* Wrap with MemoryRouter */}
            <UserSignup />
        </MemoryRouter>
    );

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
});

test("submits form with valid data", async () => {
    render(
        <MemoryRouter>  {/* Wrap with MemoryRouter */}
            <UserSignup />
        </MemoryRouter>
    );

    await act(async () => {
        fireEvent.change(screen.getByLabelText("First Name"), {
            target: { value: "John" },
        });
        fireEvent.change(screen.getByLabelText("Last Name"), {
            target: { value: "Doe" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByLabelText("Confirm Password"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
    });

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("test/signup"),
        expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
                firstname: "John",
                lastname: "Doe",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            }),
            headers: { "Content-Type": "application/json" },
        })
    );
});


test("shows error message on failed signup", async () => {

    fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ error: true, message: "Signup failed" }),
    });

    render(
        <MemoryRouter>  {/* Wrap with MemoryRouter */}
            <UserSignup />
        </MemoryRouter>
    );

    await act(async () => {
        fireEvent.change(screen.getByLabelText("First Name"), {
            target: { value: "John" },
        });
        fireEvent.change(screen.getByLabelText("Last Name"), {
            target: { value: "Doe" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByLabelText("Confirm Password"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
    });

    await waitFor(() => expect(screen.getByText("Signup failed")).toBeInTheDocument());
});

test('handles form validation errors', async () => {
    render(
        <MemoryRouter>
            <UserSignup />
        </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
        const errorMessages = screen.getAllByText("This field is required");

        expect(errorMessages).toHaveLength(3);
        expect(errorMessages[0]).toBeInTheDocument();
        expect(errorMessages[1]).toBeInTheDocument();
        expect(errorMessages[2]).toBeInTheDocument();

    });
});

test('shows validation error messages for required fields', async () => {
    render(
        <MemoryRouter>
            <UserSignup />
        </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
        const errorMessages = screen.getAllByText("This field is required");
        expect(errorMessages).toHaveLength(3); // Password, Confirm Password, and Email fields
        expect(errorMessages[0]).toBeInTheDocument();
        expect(errorMessages[1]).toBeInTheDocument();
        expect(errorMessages[2]).toBeInTheDocument();
    });
});

test("shows success message on successful form submission", async () => {
    render(
        <MemoryRouter>
            <UserSignup />
        </MemoryRouter>
    );

    // Simulate form submission
    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
        expect(screen.getByText("Signup successful")).toBeInTheDocument();
    });
});

test("shows error when passwords do not match", async () => {
    render(
        <MemoryRouter>
            <UserSignup />
        </MemoryRouter>
    );

    // Simulate typing in the form
    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "differentPassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
});


