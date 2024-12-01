import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AboutPage from "../src/pages/AboutPage/AboutPage";

describe("AboutPage Component", () => {
    test("renders main heading", () => {
        render(<AboutPage />);
        expect(screen.getByRole("heading", { name: /about bias busters/i })).toBeInTheDocument();
    });

    test("renders key features section", () => {
        render(<AboutPage />);


        expect(screen.getByRole("heading", { name: /key features:/i })).toBeInTheDocument();


        expect(screen.getByText(/bias and accuracy measurement/i)).toBeInTheDocument();
        expect(screen.getByText(/visualization/i)).toBeInTheDocument();
        expect(screen.getByText(/static data testing/i)).toBeInTheDocument();
    });

    test("renders footer with press release details", () => {
        render(<AboutPage />);
        expect(screen.getByText(/cashapp bias busters/i)).toBeInTheDocument();
        expect(screen.getByText(/press release - 7 november, 2024/i)).toBeInTheDocument();
    });

    test("renders descriptive paragraphs", () => {
        render(<AboutPage />);
        expect(
            screen.getByText(
                /we are proud to announce the launch of a new tool that helps engineers identify and address bias/i
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /our feedback so far has been great, and our product has demonstrated to the engineers/i
            )
        ).toBeInTheDocument();
    });

    test("renders all cards with descriptions", () => {
        render(<AboutPage />);

        // Verify that all cards are rendered with their descriptions
        expect(
            screen.getByText(
                /using the user’s tree-based ml model along with an open-sourced fairness assessment framework/i
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /graphs will be generated based on the user’s choice of demographics on the platform/i
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /we have generated a static dataset of 10,000 lines for the user to test their ml model/i
            )
        ).toBeInTheDocument();
    });
});
