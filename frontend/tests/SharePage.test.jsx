import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route} from "react-router-dom";
import SharePage from "../src/pages/SharePage/SharePage";
import { envConfig } from "../src/envConfig";

// Mocking the API and envConfig
jest.mock("../src/envConfig", () => ({
    envConfig: jest.fn().mockReturnValue("http://mock-backend-url.com"),
}));
global.fetch = jest.fn();

describe("SharePage", () => {
    beforeEach(() => {
        envConfig.mockReturnValue("http://mock-backend-url.com");
        fetch.mockReset();
        window.alert = jest.fn();
    });

    test("renders loading text while fetching data", async () => {
        fetch.mockResolvedValueOnce(new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({}),
        }), 1000)));

        render(
            <MemoryRouter initialEntries={["/share/someencodeddata"]}>
                <SharePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
    });

    test("displays error message when data fetch fails", async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: "Failed to fetch" }),
        });

        render(
            <MemoryRouter initialEntries={["/share/someencodeddata"]}>
                <SharePage />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument());
    });

    test("renders data correctly and calculates average bias", async () => {
        const mockData = {
            other_data: {
                currUser: "user@example.com",
                timeframe: "daily",
                selectedDemographic: "age",
                selectedValues: ["20-30"],
            },
            graph_data: [{ accuracy: 0.8 }, { accuracy: 0.9 }],
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        render(
            <MemoryRouter initialEntries={["/share/someencodeddata"]}>
                <SharePage />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Data by user/i)).toBeInTheDocument());

        // Check the overall bias color
        const overallBias = screen.getByText(/Overall Bias/i);
        expect(overallBias).toHaveTextContent("Overall Bias: 0.85"); // Calculated average
        expect(overallBias).toHaveStyle("background-color: #66ff66"); // Correct background color

        // Check the graph is rendered
        expect(screen.getByTestId("chart-component")).toBeInTheDocument();
    });

    test("renders demographics correctly", async () => {
        const mockData = {
            other_data: {
                currUser: "user@example.com",
                timeframe: "daily",
                selectedDemographic: "age",
                selectedValues: ["20-30"],
                secondSelectedDemographic: "location",
                selectedSecondValues: ["New York", "Los Angeles"],
            },
            graph_data: [{ accuracy: 0.8 }],
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        render(
            <MemoryRouter initialEntries={["/share/someencodeddata"]}>
                <SharePage />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Demographic 1:/i)).toBeInTheDocument());

        // Check for Demographic 1
        expect(screen.getByText(/Demographic 1:/i)).toBeInTheDocument();
        expect(screen.getByText("Age")).toBeInTheDocument();
        expect(screen.getByText("20-30")).toBeInTheDocument();

        // Check for Demographic 2
        expect(screen.getByText(/Demographic 2:/i)).toBeInTheDocument();
        expect(screen.getByText("Location")).toBeInTheDocument();
        expect(screen.getByText("New York")).toBeInTheDocument();
        expect(screen.getByText("Los Angeles")).toBeInTheDocument();
    });

    test("shows alert if graph data is empty", async () => {
        const mockData = {
            other_data: {
                currUser: "user@example.com",
                timeframe: "daily",
                selectedDemographic: "age",
                selectedValues: ["20-30"],
            },
            graph_data: [],
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        render(
            <MemoryRouter initialEntries={["/share/someencodeddata"]}>
                <SharePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "No data found for the selected demographics and values. Choose a different combination."
            );
        });
    });

    test("maxValue function correctly calculates max value from graphData", async () => {
        const mockData = {
            other_data: {
                currUser: "user@example.com",
                timeframe: "daily",
                selectedDemographic: "age",
                selectedValues: ["20-30"],
            },
            graph_data: {
                group1: [0.8, 0.5, 0.6],
                group2: [0.9, 0.7],
            },
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        render(
            <MemoryRouter initialEntries={["/share/someencodeddata"]}>
                <SharePage />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Data by user/i)).toBeInTheDocument());

        // Check the max value function
        expect(screen.getByTestId("chart-component")).toHaveAttribute("bias", "0.9"); // max value 0.9
    });
});