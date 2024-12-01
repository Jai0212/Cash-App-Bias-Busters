import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import PublicLayout from "../../src/Layout/PublicLayout";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    Outlet: () => <div data-testid="outlet" />,
}));

describe("PublicLayout Component", () => {
    test("renders Navbar component", () => {
        render(
            <BrowserRouter>
                <PublicLayout />
            </BrowserRouter>
        );

        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    test("renders Outlet component for child routes", () => {
        render(
            <BrowserRouter>
                <PublicLayout />
            </BrowserRouter>
        );

        expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
});
