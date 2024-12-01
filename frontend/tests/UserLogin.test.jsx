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
