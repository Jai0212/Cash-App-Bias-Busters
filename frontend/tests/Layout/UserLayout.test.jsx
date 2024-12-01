import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserLayout from "../../src/Layout/UserLayout";

// Mock the envConfig module to simulate environment variables during testing
jest.mock("../../src/envConfig", () => ({
    envConfig: () => "test", // Mocked envConfig response
}));

describe("UserLayout Component", () => {
    test("renders UserNavbar component", () => {
        render(
            <BrowserRouter>
                <UserLayout />
            </BrowserRouter>
        );
        // Ensure UserNavbar is rendered by checking for the navigation role
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

});
