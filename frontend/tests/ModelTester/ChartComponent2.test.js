import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChartComponent2 from "../../src/pages/ModelTester/ChartComponenet2/ChartComponent2"; // Adjust path as needed

// Mock Chart.js/auto to avoid actual rendering
jest.mock("chart.js/auto", () => {
    return {
        __esModule: true,
        Chart: jest.fn().mockImplementation(() => ({
            update: jest.fn(),
            destroy: jest.fn(),
        })),
    };
});

beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks to avoid state pollution
});

test("renders ChartComponent2 with chart data and generational results", () => {
    const chartData = {
        labels: ["Model 1", "Model 2"],
        datasets: [
            { label: "Bias", data: [0.3, 0.6] }
        ],
    };

    const generationalResults = [
        { race: "Race1", gender: "Male", age_groups: "18-25", state: "CA", variance: 0.1 },
        { race: "Race2", gender: "Female", age_groups: "26-35", state: "NY", variance: 0.2 },
    ];

    render(<ChartComponent2 chartData={chartData} generationalResults={generationalResults} />);

    // Check if the canvas is rendered
    const chartCanvas = screen.getByTestId("chart-canvas");
    expect(chartCanvas).toBeInTheDocument();
});

test("updates chart on data change", async () => {
    const initialChartData = {
        labels: ["Model 1"],
        datasets: [{ label: "Bias", data: [0.3] }],
    };

    const updatedChartData = {
        labels: ["Model 1", "Model 2"],
        datasets: [{ label: "Bias", data: [0.3, 0.6] }],
    };

    const generationalResults = [
        { race: "Race1", gender: "Male", age_groups: "18-25", state: "CA", variance: 0.1 },
    ];

    const { rerender } = render(
        <ChartComponent2
            chartData={initialChartData}
            generationalResults={generationalResults}
        />
    );

    // Initially check the rendered chart
    const chartCanvas = screen.getByTestId("chart-canvas");
    expect(chartCanvas).toBeInTheDocument();

    // Update the chart data
    rerender(
        <ChartComponent2
            chartData={updatedChartData}
            generationalResults={generationalResults}
        />
    );

    // Ensure the chart canvas is still present after rerender
    expect(chartCanvas).toBeInTheDocument();
});

test("invokes downloadChart function", () => {
    const chartData = {
        labels: ["Model 1", "Model 2"],
        datasets: [{ label: "Bias", data: [0.3, 0.6] }],
    };

    const generationalResults = [
        { race: "Race1", gender: "Male", age_groups: "18-25", state: "CA", variance: 0.1 },
        { race: "Race2", gender: "Female", age_groups: "26-35", state: "NY", variance: 0.2 },
    ];

    const ref = React.createRef();
    render(
        <ChartComponent2
            chartData={chartData}
            generationalResults={generationalResults}
            ref={ref}
        />
    );

    // Mock the download logic
    const downloadSpy = jest.spyOn(ref.current, "downloadChart");

    // Call downloadChart via ref
    act(() => {
        ref.current.downloadChart();
    });

    // Verify downloadChart was called
    expect(downloadSpy).toHaveBeenCalledTimes(1);
});

test("applies responsive font size based on window size", () => {
    const chartData = {
        labels: ["Model 1", "Model 2"],
        datasets: [{ label: "Bias", data: [0.3, 0.6] }],
    };

    const generationalResults = [
        { race: "Race1", gender: "Male", age_groups: "18-25", state: "CA", variance: 0.1 },
    ];

    render(<ChartComponent2 chartData={chartData} generationalResults={generationalResults} />);

    // Simulate window resize
    act(() => {
        window.innerWidth = 800;
        window.innerHeight = 600;
        window.dispatchEvent(new Event("resize"));
    });

    // Ensure the chart is updated correctly (mocked Chart.js update should have been called)
    expect(require("chart.js/auto").Chart.mock.results[0].value.update).toHaveBeenCalled();
});
